import { z } from 'zod';

export const translationDisplayModeSchema = z.enum([
  'replace',
  'side-by-side',
  'tooltip',
]);

export const translationRuleSchema = z.object({
  selector: z.string().min(1, 'selector is required'),
  action: z.string().min(1, 'action is required'),
  batch_size: z.number().int().positive().default(1),
  display: translationDisplayModeSchema.default('replace'),
});

export const recipeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  author: z.string().min(1, 'author is required'),
  url_pattern: z.string().min(1, 'url_pattern is required'),
  rules: z.array(translationRuleSchema).min(1, 'at least one rule is required'),
  ignore: z.array(z.string().min(1)).default([]),
  trigger: z.enum(['on_load', 'on_scroll', 'on_button']),
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
