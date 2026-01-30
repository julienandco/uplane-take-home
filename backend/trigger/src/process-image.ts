import { task, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

type SupportedFormat = 'png' | 'jpeg' | 'webp';

const SUPPORTED_FORMATS: Record<string, SupportedFormat> = {
  'jpg': 'jpeg',
  'jpeg': 'jpeg',
  'png': 'png',
  'webp': 'webp',
};

const CONTENT_TYPES: Record<SupportedFormat, string> = {
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
};

function getOutputFormat(imageUrl: string): SupportedFormat {
  const extension = imageUrl.split('.').pop()?.toLowerCase().split('?')[0] || '';
  return SUPPORTED_FORMATS[extension] || 'png';
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY!;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

export const processImageTask = task({
  id: "process-image",
  maxDuration: 300, // 5 minutes max
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: { imageUrl: string, fileId: string }) => {
    if(!SUPABASE_BUCKET) {
      throw new Error("SUPABASE_STORAGE_BUCKET is not set");
    }
    const { imageUrl, fileId } = payload;

    logger.info("Starting image processing", { imageUrl });

    const { error: startUpdateError } = await supabase.from('image_processing_tasks').update({
      status: 'ongoing',
    }).eq('id', fileId);

    if(startUpdateError) {
      // Be optimistic and continue with image processing
      logger.error("Failed to update task status", { error: startUpdateError });
      logger.error("Continuing with image processing", { imageUrl });
    }

    // Step 1: Call remove.bg API to remove background
    const formData = new FormData();
    formData.append("image_url", imageUrl);
    formData.append("size", "auto");

    logger.info("Calling remove.bg API");

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      logger.error("remove.bg API error", {
        status: removeBgResponse.status,
        error: errorText,
      });
      throw new Error(`remove.bg API error: ${removeBgResponse.status} - ${errorText}`);
    }

    // Get the processed image as a buffer
    const imageBuffer = await removeBgResponse.arrayBuffer();

    logger.info("Background removed successfully", {
      imageSize: imageBuffer.byteLength,
    });

    // Step 2: Process image with Sharp (e.g., flip horizontally)
    // Preserve original format (jpg, png, webp) or default to png
    const outputFormat = getOutputFormat(imageUrl);
    logger.info("Processing image with Sharp (horizontal flip)", { outputFormat });
    
    let sharpInstance = sharp(Buffer.from(imageBuffer)).flop();
    
    // Apply the appropriate output format
    switch (outputFormat) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: 90 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: 90 });
        break;
      case 'png':
      default:
        sharpInstance = sharpInstance.png();
        break;
    }
    
    const processedImageBuffer = await sharpInstance.toBuffer();

    logger.info("Sharp processing complete", {
      processedSize: processedImageBuffer.length,
      format: outputFormat,
    });

    // Step 3: Upload to Supabase Storage
    const filePath = `${fileId}/processed`
    const contentType = CONTENT_TYPES[outputFormat];

    logger.info("Uploading to Supabase Storage", { filePath, contentType });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, processedImageBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      logger.error("Supabase upload error", { error: uploadError });
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    logger.info("Image processed and uploaded successfully", {
      path: uploadData.path,
      publicUrl: publicUrlData.publicUrl,
    });

    // Update the task status in the database
    const { error: updateError } = await supabase.from('image_processing_tasks').update({
      status: 'successful',
      processed_image_url: publicUrlData.publicUrl,
    }).eq('id', fileId);

    if (updateError) {
      logger.error("Failed to update task status", { error: updateError });
    }

    return {
      originalUrl: imageUrl,
      processedPath: uploadData.path,
      publicUrl: publicUrlData.publicUrl,
      filePath,
    };
  },
});
