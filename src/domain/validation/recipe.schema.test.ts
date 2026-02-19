import { describe, expect, it } from 'vitest';

import { recipeSchema } from './recipe.schema';

describe('recipeSchema', () => {
  it('applies defaults for rule batch_size, display, and recipe ignore', () => {
    const parsed = recipeSchema.parse({
      name: 'Example',
      author: 'Lensate',
      url_pattern: 'https://example.com/*',
      trigger: 'on_load',
      rules: [{ selector: '.title', action: 'translate' }],
    });

    expect(parsed.ignore).toEqual([]);
    expect(parsed.rules[0]?.batch_size).toBe(1);
    expect(parsed.rules[0]?.display).toBe('replace');
  });

  it('requires at least one translation rule', () => {
    const result = recipeSchema.safeParse({
      name: 'Example',
      author: 'Lensate',
      url_pattern: 'https://example.com/*',
      trigger: 'on_load',
      rules: [],
    });

    expect(result.success).toBe(false);
  });
});
