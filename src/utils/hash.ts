// SHA-256 hash for browser compatibility
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePasscode(passcode: string, hash: string): Promise<boolean> {
  const hashed = await hashPasscode(passcode);
  return hashed === hash;
}
