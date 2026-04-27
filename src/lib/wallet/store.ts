// Local persistence for vault, balances, and activity (encrypted seed only).
import { ChainId } from "./crypto";

const K = {
  vault: "sonder.vault.v1",       // { cipher, pinHash, wordCount, createdAt }
  pinAttempts: "sonder.pinAttempts",
  balances: "sonder.balances.v1", // Record<ChainId, number>
  txs: "sonder.txs.v1",           // Tx[]
  settings: "sonder.settings.v1",
} as const;

export interface Vault {
  cipher: string;
  wordCount: 12 | 24;
  createdAt: number;
  backedUp: boolean;
}

export interface Tx {
  id: string;
  chain: ChainId;
  type: "send" | "receive" | "swap" | "buy";
  amount: number;
  usd: number;
  fee: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  to?: string;
  from?: string;
  note?: string;
  meta?: Record<string, unknown>;
}

export interface Settings {
  biometric: boolean;
  autoLockMinutes: number;
  notifications: boolean;
}

const DEFAULT_BALANCES: Record<ChainId, number> = {
  BTC: 0,
  ETH: 0,
  SOL: 0,
  USDT: 0,
};

const DEFAULT_SETTINGS: Settings = {
  biometric: false,
  autoLockMinutes: 5,
  notifications: true,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getVault: (): Vault | null => read<Vault | null>(K.vault, null),
  setVault: (v: Vault) => write(K.vault, v),
  clearVault: () => {
    localStorage.removeItem(K.vault);
    localStorage.removeItem(K.balances);
    localStorage.removeItem(K.txs);
    localStorage.removeItem(K.settings);
    localStorage.removeItem(K.pinAttempts);
  },

  getBalances: (): Record<ChainId, number> => read(K.balances, DEFAULT_BALANCES),
  setBalances: (b: Record<ChainId, number>) => write(K.balances, b),

  getTxs: (): Tx[] => read<Tx[]>(K.txs, []),
  addTx: (tx: Tx) => {
    const all = store.getTxs();
    all.unshift(tx);
    write(K.txs, all.slice(0, 200));
  },
  updateTx: (id: string, patch: Partial<Tx>) => {
    const all = store.getTxs().map((t) => (t.id === id ? { ...t, ...patch } : t));
    write(K.txs, all);
  },

  getSettings: (): Settings => ({ ...DEFAULT_SETTINGS, ...read(K.settings, DEFAULT_SETTINGS) }),
  setSettings: (s: Settings) => write(K.settings, s),

  getPinAttempts: (): number => read<number>(K.pinAttempts, 0),
  setPinAttempts: (n: number) => write(K.pinAttempts, n),
};

export function seedDemoBalances(): Record<ChainId, number> {
  const b: Record<ChainId, number> = { BTC: 0.0142, ETH: 0.624, SOL: 4.21, USDT: 184.5 };
  store.setBalances(b);
  return b;
}
