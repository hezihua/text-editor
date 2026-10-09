import { generateText, Output, type LanguageModelUsage } from "ai";

import type { CheckDirectionId } from "./check-directions";
import { getLanguageModel } from "./llm";
import { buildCheckPrompt, buildCheckPromptStrict } from "./prompts";
import { checkResultSchema } from "./schemas";

const MAX_ATTEMPTS = 3;

async function callCheckOnce(
  chunkText: string,
  direction: CheckDirectionId,
  strict: boolean,
): Promise<{
  output: unknown;
  usage?: LanguageModelUsage;
}> {
  const model = getLanguageModel();
  const prompt = strict
    ? buildCheckPromptStrict(chunkText, direction)
    : buildCheckPrompt(chunkText, direction);

  const { output, usage } = await generateText({
    model,
    output: Output.object({ schema: checkResultSchema }),
    prompt,
  });

  return { output, usage };
}

export async function checkSingleChunk(
  chunkText: string,
  direction: CheckDirectionId,
): Promise<{ raw: unknown; usage?: LanguageModelUsage; retries: number }> {
  let lastError: unknown;
  let retries = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const strict = attempt > 0;
    try {
      const { output, usage } = await callCheckOnce(
        chunkText,
        direction,
        strict,
      );
      if (output == null) {
        throw new Error("empty_output");
      }
      const validated = checkResultSchema.safeParse(output);
      if (!validated.success) {
        retries += 1;
        lastError = validated.error;
        continue;
      }
      return { raw: validated.data, usage, retries };
    } catch (e) {
      retries += 1;
      lastError = e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("检查块失败，请稍后重试");
}
