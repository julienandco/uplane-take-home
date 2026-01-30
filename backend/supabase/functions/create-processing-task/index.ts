import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { tasks } from "https://esm.sh/@trigger.dev/sdk@3.3.17/v3";
import { InternalErrorResponse, OkResponse, SuccessResponse, UnprocessableContentResponse } from "../_shared/response.ts";
import { z } from "https://esm.sh/zod@4.1.12";

const processImagePayloadSchema = z.object({
  type: z.enum(["INSERT", "UPDATE", "DELETE"]),
  record: z.object({
    id: z.string(),
    name: z.string(),
    bucket_id: z.string(),
  }),
});

const TASK_NAME = "process-image";

Deno.serve(async (req) => {
  try {
    const { data: payload, error: parseError } =
    processImagePayloadSchema.safeParse(await req.json());
    if (parseError) {
      console.error("Error parsing payload:", parseError)
      return new UnprocessableContentResponse(parseError);
    }
    
    console.log("Received storage webhook:", JSON.stringify(payload, null, 2))

    // Only process inserts to the 'images' bucket
    if (payload.type !== "INSERT" || payload.record.bucket_id !== "images") {
      console.log("Ignored: not an insert to images bucket", payload.record.bucket_id)
      return new OkResponse();
    }

    // Only process 'raw' files (skip processed files)
    const objectName = payload.record.name
    if (!objectName.endsWith("/raw")) {
      console.log("Ignored: not a raw file", objectName)
      return new OkResponse();
    }

    // Extract fileId from the path (format: {fileId}/raw)
    const fileId = objectName.replace("/raw", "")
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "http://host.docker.internal:54321"
    
    // Construct the public URL for the uploaded image
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/images/${objectName}`
    
    console.log("Triggering process-image task:", { fileId, imageUrl })

    try {
      const run = await tasks.trigger(TASK_NAME, {
        imageUrl,
        fileId,
      }, {
        tags: [fileId],
      });
  
      return new SuccessResponse(run);
    } catch (error) {
      console.error("Error handling request:", error);
      return new InternalErrorResponse();
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new InternalErrorResponse();
  }
})
