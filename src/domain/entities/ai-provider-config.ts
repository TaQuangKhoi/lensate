export interface AIProviderConfig {
  provider: string;
  api_key: string;
  model: string;
  base_url?: string;
  system_prompt?: string;
}
