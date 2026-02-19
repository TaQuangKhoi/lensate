import OpenAI from 'openai';
import type { TranslationPort } from '@/src/domain/ports/translation.port';
import { TranslationError } from '@/src/shared/errors/lensate-error';

export class OpenAIProvider implements TranslationPort {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
    baseURL?: string,
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });
  }

  async translate(texts: string[], systemPrompt: string): Promise<string[]> {
    const input = texts.map((text, index) => `${index + 1}. ${text}`).join('\n');
    const completion = await this.client.chat.completions
      .create({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Translate each numbered line and keep line order.\n${input}` },
        ],
      })
      .catch((error) => {
        throw new TranslationError(String(error));
      });

    const content = completion.choices[0]?.message?.content ?? '';
    const lines = content
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return texts.map((text, index) => lines[index] ?? text);
  }
}
