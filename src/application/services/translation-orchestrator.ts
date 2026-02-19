import type { Recipe } from '@/src/domain/entities/recipe';
import type { DOMPort } from '@/src/domain/ports/dom.port';
import { TranslatePageUseCase } from '@/src/application/use-cases/translate-page.use-case';

export class TranslationOrchestrator {
  constructor(
    private readonly translator: TranslatePageUseCase,
    private readonly dom: DOMPort,
  ) {}

  async run(recipe: Recipe, systemPrompt: string): Promise<void> {
    if (recipe.trigger === 'on_load') {
      await this.translator.run(recipe, systemPrompt);
      return;
    }

    if (recipe.trigger === 'on_scroll') {
      for (const rule of recipe.rules) {
        this.dom.observeMutations(rule.selector, async () => {
          await this.translator.run(recipe, systemPrompt);
        });
      }
      await this.translator.run(recipe, systemPrompt);
      return;
    }

    const button = document.createElement('button');
    button.textContent = 'Translate';
    button.type = 'button';
    button.style.cssText =
      'position:fixed;z-index:2147483647;bottom:16px;right:16px;background:#111827;color:#fff;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;';
    button.addEventListener('click', async () => {
      await this.translator.run(recipe, systemPrompt);
    });
    document.body.appendChild(button);
  }
}
