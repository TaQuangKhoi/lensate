import type { TranslationPort } from '@/src/domain/ports/translation.port';
import { TranslationError } from '@/src/shared/errors/lensate-error';

export class GeminiProvider implements TranslationPort {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async translate(texts: string[], systemPrompt: string): Promise<string[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nTranslate the lines and keep order:\n${texts
                    .map((line, index) => `${index + 1}. ${line}`)
                    .join('\n')}`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new TranslationError(`Gemini request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const lines = output
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return texts.map((text, index) => lines[index] ?? text);
  }
}
