import { corsHeaders } from "./cors.ts";
import { ZodError } from "https://esm.sh/zod@4.1.12";

export class InternalErrorResponse extends Response {
  constructor() {
    super(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}

export class OkResponse extends Response {
  constructor() {
    super("OK", {
      headers: { ...corsHeaders },
    });
  }
}

export class SuccessResponse extends Response {
  constructor(data: Record<string, unknown>) {
    super(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export class UnprocessableContentResponse extends Response {
    constructor(zodError: ZodError) {
      super(JSON.stringify({ error: zodError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 422,
      });
    }
  }