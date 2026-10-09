import { createOpenAI } from "@ai-sdk/openai";

export function getLanguageModel() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 OPENAI_API_KEY");
  }

  const baseURL =
    process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1";

  const isOpenRouter = baseURL.includes("openrouter.ai");

  const provider = createOpenAI({
    apiKey,
    baseURL,
    headers: isOpenRouter
      ? {
          "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
          "X-Title": process.env.OPENROUTER_APP_NAME ?? "text-editor",
        }
      : undefined,
  });

  const modelId =
    process.env.AI_MODEL ??
    (isOpenRouter ? "deepseek/deepseek-chat" : "deepseek-chat");

  return provider.chat(modelId);
}
