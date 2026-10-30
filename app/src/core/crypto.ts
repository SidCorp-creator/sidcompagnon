// Briques de chiffrement (ticket #3, « coquille », étape 2). Traduction fidèle des fonctions de site/app.js :
// b64e / b64d, pinKey (PBKDF2-SHA256 → AES-GCM 256), encJ / decJ (JSON chiffré {iv, ct}), rawKey, phDerive (clé maître),
// docEncrypt / docDecrypt (format « SNE1 » + iv 12 octets + chiffré), bioKey (HKDF du secret Face ID).
// Mêmes algorithmes, mêmes paramètres, mêmes formats : ce qui a été chiffré par l'ancien code s'ouvre avec celui-ci, et inversement
// (vérifié par tests/crypto.test.js). La logique du coffre (codes, appareils, récupération) reste dans app.js.

const subtle = () => globalThis.crypto.subtle;
const enc = new TextEncoder(), dec = new TextDecoder();

export const b64e = (u: ArrayBuffer | Uint8Array): string => { let s = ""; const a = new Uint8Array(u); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); };
export const b64d = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Clé AES-GCM tirée d'un code (ou mot de passe) par PBKDF2-SHA256. */
export async function pinKey(pin: string, salt: string, iter: number): Promise<CryptoKey> {
  const base = await subtle().importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey({ name: "PBKDF2", salt: b64d(salt), iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export interface Sealed { iv: string; ct: string }
export async function encJ(key: CryptoKey, obj: unknown): Promise<Sealed> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
  return { iv: b64e(iv), ct: b64e(ct) };
}
export async function decJ(key: CryptoKey, e: Sealed): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const pt = await subtle().decrypt({ name: "AES-GCM", iv: b64d(e.iv) }, key, b64d(e.ct));
  return JSON.parse(dec.decode(pt));
}
export const rawKey = (raw: string): Promise<CryptoKey> => subtle().importKey("raw", b64d(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
export const rnd = (n: number): string => b64e(globalThis.crypto.getRandomValues(new Uint8Array(n)));

/** Clé maître tirée d'une phrase secrète ou du mot de passe du compte (texte normalisé NFC). */
export async function phDerive(ph: string, salt: string, iter: number): Promise<{ raw: string; key: CryptoKey }> {
  const base = await subtle().importKey("raw", enc.encode(String(ph).normalize("NFC")), "PBKDF2", false, ["deriveBits"]);
  const raw = b64e(await subtle().deriveBits({ name: "PBKDF2", salt: b64d(salt), iterations: iter, hash: "SHA-256" }, base, 256));
  return { raw, key: await rawKey(raw) };
}

/** Documents : « SNE1 » + iv (12 octets) + contenu chiffré. */
export const ENC_MAGIC = [83, 78, 69, 49];
export const isEnc = (u: Uint8Array): boolean => u.length > 16 && ENC_MAGIC.every((c, i) => u[i] === c);
export async function docEncryptBytes(bytes: ArrayBuffer, key: CryptoKey): Promise<Uint8Array> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv }, key, bytes));
  const out = new Uint8Array(16 + ct.length); out.set(ENC_MAGIC, 0); out.set(iv, 4); out.set(ct, 16); return out;
}
export async function docDecryptBytes(u: Uint8Array, key: CryptoKey): Promise<ArrayBuffer> {
  return subtle().decrypt({ name: "AES-GCM", iv: u.slice(4, 16) }, key, u.slice(16));
}

/** Face ID / Touch ID : clé AES-GCM tirée du secret PRF de la passkey (HKDF-SHA256, info « sidnote-bio »). */
export async function bioKey(first: BufferSource): Promise<CryptoKey> {
  const hk = await subtle().importKey("raw", first, "HKDF", false, ["deriveKey"]);
  return subtle().deriveKey({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: enc.encode("sidnote-bio") }, hk, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
