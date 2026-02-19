export interface TranslationPort {
  translate(texts: string[], systemPrompt: string): Promise<string[]>;
}
