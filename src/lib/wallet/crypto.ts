// Sonder wallet core: BIP39 seed generation, AES encryption, deterministic
// per-chain address derivation (simulated for Phase 1 — uses seed-derived
// hashes to produce realistic-looking addresses without pulling heavy libs).
import * as bip39 from "bip39";
import CryptoJS from "crypto-js";

export type ChainId = "BTC" | "ETH" | "SOL" | "USDT";

export interface ChainMeta {
  id: ChainId;
  name: string;
  symbol: string;
  color: string;
  decimals: number;
  coingeckoId: string;
  // for USDT we ride on ETH address (ERC-20)
  derivedFrom?: ChainId;
}

export const CHAINS: Record<ChainId, ChainMeta> = {
  BTC: { id: "BTC", name: "Bitcoin", symbol: "BTC", color: "#f7931a", decimals: 8, coingeckoId: "bitcoin" },
  ETH: { id: "ETH", name: "Ethereum", symbol: "ETH", color: "#627eea", decimals: 18, coingeckoId: "ethereum" },
  SOL: { id: "SOL", name: "Solana", symbol: "SOL", color: "#9945ff", decimals: 9, coingeckoId: "solana" },
  USDT: { id: "USDT", name: "Tether USD", symbol: "USDT", color: "#26a17b", decimals: 6, coingeckoId: "tether", derivedFrom: "ETH" },
};

export const CHAIN_LIST: ChainMeta[] = Object.values(CHAINS);

// ---- Seed phrase ----
export function generateSeedPhrase(strength: 128 | 256 = 128): string {
  // 128 → 12 words, 256 → 24 words
  return bip39.generateMnemonic(strength);
}
export function isValidSeed(phrase: string): boolean {
  return bip39.validateMnemonic(phrase.trim().toLowerCase());
}
export function seedToHex(phrase: string, passphrase = ""): string {
  return bip39.mnemonicToSeedSync(phrase, passphrase).toString("hex");
}

// ---- Encryption (AES + PBKDF2) ----
const SALT = "sonder-v1-salt";
function deriveKey(pin: string): string {
  return CryptoJS.PBKDF2(pin, SALT, { keySize: 256 / 32, iterations: 50_000 }).toString();
}
export function encryptSeed(phrase: string, pin: string): string {
  return CryptoJS.AES.encrypt(phrase, deriveKey(pin)).toString();
}
export function decryptSeed(cipher: string, pin: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, deriveKey(pin));
    const out = bytes.toString(CryptoJS.enc.Utf8);
    if (!out) return null;
    return out;
  } catch {
    return null;
  }
}

// ---- Address derivation (Phase 1: deterministic mock) ----
function hash(input: string): string {
  return CryptoJS.SHA256(input).toString();
}
function base58ish(hex: string, len: number): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < hex.length && out.length < len; i += 2) {
    out += alphabet[parseInt(hex.substr(i, 2), 16) % alphabet.length];
  }
  return out;
}
export function deriveAddress(seedHex: string, chain: ChainId): string {
  const meta = CHAINS[chain];
  const target = meta.derivedFrom ?? chain;
  const h = hash(seedHex + ":" + target);
  switch (target) {
    case "BTC":
      return "bc1q" + base58ish(h, 38).toLowerCase();
    case "ETH":
      return "0x" + h.slice(0, 40);
    case "SOL":
      return base58ish(h + hash(h), 44);
    default:
      return h.slice(0, 40);
  }
}

export function shortAddr(addr: string, head = 6, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
