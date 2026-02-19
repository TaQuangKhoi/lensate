import type { CryptoPort } from '@/src/domain/ports/crypto.port';
import type { StoragePort } from '@/src/domain/ports/storage.port';
import { STORAGE_KEYS } from '@/src/shared/constants/defaults';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): ArrayBuffer {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
}

export class WebCryptoAdapter implements CryptoPort {
  constructor(private readonly storage: StoragePort) {}

  async encrypt(plaintext: string): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext),
    );
    return `${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    const [ivB64, dataB64] = ciphertext.split('.');
    if (!ivB64 || !dataB64) return '';
    const key = await this.getKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(fromBase64(ivB64)) },
      key,
      fromBase64(dataB64),
    );
    return decoder.decode(decrypted);
  }

  private async getKey(): Promise<CryptoKey> {
    let secret = await this.storage.get<string>(STORAGE_KEYS.cryptoSecret);
    if (!secret) {
      secret = toBase64(crypto.getRandomValues(new Uint8Array(32)));
      await this.storage.set(STORAGE_KEYS.cryptoSecret, secret);
    }
    return crypto.subtle.importKey(
      'raw',
      fromBase64(secret),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }
}
