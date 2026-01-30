import { task, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

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
  run: async (payload: { imageUrl: string }) => {
    const { imageUrl } = payload;

    logger.info("Starting image processing", { imageUrl });

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
    const imageData = new Uint8Array(imageBuffer);

    logger.info("Background removed successfully", {
      imageSize: imageData.length,
    });

    // Step 2: Upload to Supabase Storage
    const fileName = `processed-${Date.now()}-${crypto.randomUUID()}.png`;
    const filePath = `images/${fileName}`;

    logger.info("Uploading to Supabase Storage", { filePath });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, imageData, {
        contentType: "image/png",
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

    return {
      originalUrl: imageUrl,
      processedPath: uploadData.path,
      publicUrl: publicUrlData.publicUrl,
      fileName,
    };
  },
});
