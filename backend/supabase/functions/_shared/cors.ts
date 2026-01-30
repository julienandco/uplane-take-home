export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // TODO: restrict this to a specific domain in production
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export const handleCorsPreflightRequest = (): Response => {
  return new Response("ok", { headers: corsHeaders });
};
