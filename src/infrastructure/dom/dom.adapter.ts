import type { TranslationDisplayMode } from '@/src/domain/entities/translation-rule';
import type { TranslationResult } from '@/src/domain/entities/translation-result';
import type { DOMPort } from '@/src/domain/ports/dom.port';

export class DOMAdapter implements DOMPort {
  constructor(private readonly ignoreSelectors: string[] = []) {}

  queryElements(selector: string): Element[] {
    return Array.from(document.querySelectorAll(selector)).filter(
      (element) => !this.ignoreSelectors.some((ignore) => element.closest(ignore)),
    );
  }

  observeMutations(selector: string, callback: (elements: Element[]) => void): void {
    const observer = new MutationObserver(() => {
      const elements = this.queryElements(selector);
      if (elements.length > 0) callback(elements);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  injectTranslation(
    element: Element,
    result: TranslationResult,
    displayMode: TranslationDisplayMode,
  ): void {
    if (displayMode === 'replace') {
      if (!element.getAttribute('data-lensate-original')) {
        element.setAttribute('data-lensate-original', result.original);
      }
      element.textContent = result.translated;
      return;
    }

    if (displayMode === 'tooltip') {
      element.setAttribute('title', result.translated);
      return;
    }

    if (element.nextElementSibling?.classList.contains('lensate-translation')) {
      element.nextElementSibling.textContent = result.translated;
      return;
    }

    const translatedNode = document.createElement('span');
    translatedNode.className = 'lensate-translation';
    translatedNode.style.cssText =
      'display:block;margin-top:4px;padding:4px 8px;border-left:2px solid #60a5fa;background:#eff6ff;color:#1e3a8a;border-radius:4px;';
    translatedNode.textContent = result.translated;
    element.insertAdjacentElement('afterend', translatedNode);
  }
}
