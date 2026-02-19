export class LensateError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'LensateError';
  }
}

export class TranslationError extends LensateError {
  constructor(message: string) {
    super(message, 'TRANSLATION_ERROR');
    this.name = 'TranslationError';
  }
}

export class APIKeyError extends LensateError {
  constructor(message: string) {
    super(message, 'API_KEY_ERROR');
    this.name = 'APIKeyError';
  }
}

export class RecipeValidationError extends LensateError {
  constructor(message: string) {
    super(message, 'RECIPE_VALIDATION_ERROR');
    this.name = 'RecipeValidationError';
  }
}
