import type { Recipe } from '@/src/domain/entities/recipe';
import type { TranslationResult } from '@/src/domain/entities/translation-result';
import type { CachePort } from '@/src/domain/ports/cache.port';
import type { DOMPort } from '@/src/domain/ports/dom.port';
import type { TranslationPort } from '@/src/domain/ports/translation.port';
import { TextBatchingService } from '@/src/application/services/text-batching.service';

export class TranslatePageUseCase {
  constructor(
    private readonly dom: DOMPort,
    private readonly translator: TranslationPort,
    private readonly cache: CachePort,
    private readonly batching: TextBatchingService,
  ) {}

  async run(recipe: Recipe, systemPrompt: string): Promise<number> {
    let translatedCount = 0;

    for (const rule of recipe.rules) {
      if (rule.action !== 'translate') continue;
      const nodes = this.dom.queryElements(rule.selector);
      const translatable = nodes
        .map((element) => ({
          element,
          text: element.textContent?.trim() ?? '',
        }))
        .filter((item) => item.text.length > 0);

      for (const batch of this.batching.split(translatable, rule.batch_size || 1)) {
        const translatedBatch = await this.translateBatch(batch.map((item) => item.text), systemPrompt);
        batch.forEach((item, index) => {
          const result: TranslationResult = {
            original: item.text,
            translated: translatedBatch[index] ?? item.text,
            selector: rule.selector,
            elementRef: item.element.tagName,
          };
          this.dom.injectTranslation(item.element, result, rule.display);
          translatedCount += 1;
        });
      }
    }

    return translatedCount;
  }

  private async translateBatch(texts: string[], systemPrompt: string): Promise<string[]> {
    const translated = Array<string>(texts.length).fill('');
    const misses: string[] = [];
    const missesIndex: number[] = [];

    for (const [index, text] of texts.entries()) {
      const hash = await this.batching.hash(text);
      const cached = await this.cache.lookup(hash);
      if (cached) {
        translated[index] = cached.translatedText;
      } else {
        misses.push(text);
        missesIndex.push(index);
      }
    }

    if (misses.length > 0) {
      const fresh = await this.translator.translate(misses, systemPrompt);
      for (const [offset, text] of misses.entries()) {
        const output = fresh[offset] ?? text;
        const index = missesIndex[offset];
        translated[index] = output;
        const hash = await this.batching.hash(text);
        await this.cache.store(hash, {
          hash,
          translatedText: output,
          timestamp: Date.now(),
          model: 'configured-model',
        });
      }
    }

    return translated.map((value, index) => value || texts[index]);
  }
}
