import type { TranslationDisplayMode } from '../entities/translation-rule';
import type { TranslationResult } from '../entities/translation-result';

export interface DOMPort {
  queryElements(selector: string): Element[];
  observeMutations(selector: string, callback: (elements: Element[]) => void): void;
  injectTranslation(
    element: Element,
    result: TranslationResult,
    displayMode: TranslationDisplayMode,
  ): void;
}
