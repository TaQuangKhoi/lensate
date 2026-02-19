import type { TranslationRule } from './translation-rule';

export type TranslationTrigger = 'on_load' | 'on_scroll' | 'on_button';

export interface Recipe {
  name: string;
  author: string;
  url_pattern: string;
  rules: TranslationRule[];
  ignore: string[];
  trigger: TranslationTrigger;
}
