import { configure } from "https://esm.sh/@trigger.dev/sdk@3.3.17/v3";
// Initialize trigger.dev
const accessToken = Deno.env.get("TRIGGER_ACCESS_TOKEN");
if (!accessToken) {
  throw new Error("TRIGGER_ACCESS_TOKEN is not set");
}
configure({ accessToken });

export const RUN_FAILURE_STATUS = [
  "CANCELED",
  "FAILED",
  "CRASHED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
];
