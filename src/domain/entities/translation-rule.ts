export type TranslationDisplayMode = 'replace' | 'side-by-side' | 'tooltip';

export interface TranslationRule {
  selector: string;
  action: string;
  batch_size: number;
  display: TranslationDisplayMode;
}
