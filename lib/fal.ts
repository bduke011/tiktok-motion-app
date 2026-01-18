import { fal } from "@fal-ai/client";

// Configure fal.ai client to use our proxy endpoint
// This keeps the API key secure on the server
fal.config({
  proxyUrl: "/api/fal/proxy",
});

export { fal };
