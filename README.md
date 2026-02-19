# Lensate

Generic DOM translation extension built with WXT + React + TypeScript.

## Architecture

- `src/domain`: entities, ports, and recipe validation schema
- `src/application`: use-cases and orchestration services
- `src/infrastructure`: adapters for DOM, storage, crypto, and AI providers
- `src/shared`: constants, errors, and typed messaging
- `entrypoints`: background/content scripts, popup, and options UI

## Development

```bash
pnpm install
pnpm compile
pnpm build
```
