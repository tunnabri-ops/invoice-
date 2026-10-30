/**
 * Safely encodes any UTF-8 string (including currency symbols like €, ৳, £, ¥,
 * emojis, non-Latin characters, and accents) to Base64.
 * Standard window.btoa fails when characters exceed Latin1 code point range (0-255).
 */
export function safeBase64Encode(input: string): string {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    // Fallback using percent-encoding
    return btoa(unescape(encodeURIComponent(input)));
  }
}
