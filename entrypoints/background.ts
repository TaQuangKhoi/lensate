import { createLogger } from '@/src/shared/logger';

const log = createLogger('background');

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message) => {
    try {
      if (message?.type === 'lensate/toggle-origin') {
        const key = 'lensate.enabledByOrigin';
        const current = ((await browser.storage.local.get(key))[key] ?? {}) as Record<string, boolean>;
        current[message.origin] = message.enabled;
        await browser.storage.local.set({ [key]: current });
        return;
      }

      if (message?.type === 'lensate/refresh') {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
          await browser.tabs.reload(tabs[0].id);
        }
      }
    } catch (error) {
      log.error('Failed to process background message', message, error);
    }
  });
});
