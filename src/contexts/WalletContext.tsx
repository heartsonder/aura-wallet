import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CHAIN_LIST,
  ChainId,
  decryptSeed,
  deriveAddress,
  encryptSeed,
  generateSeedPhrase,
  isValidSeed,
  seedToHex,
} from "@/lib/wallet/crypto";
import { fetchPrices, PriceMap } from "@/lib/wallet/prices";
import { seedDemoBalances, store, Tx, Vault } from "@/lib/wallet/store";

type Status = "loading" | "no-wallet" | "locked" | "unlocked";

interface WalletCtx {
  status: Status;
  vault: Vault | null;
  seed: string | null;            // only present when unlocked
  addresses: Record<ChainId, string>;
  balances: Record<ChainId, number>;
  prices: PriceMap;
  txs: Tx[];
  totalUsd: number;

  createWallet: (phrase: string, pin: string, wordCount: 12 | 24) => void;
  importWallet: (phrase: string, pin: string) => boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  reset: () => void;
  markBackedUp: () => void;

  send: (chain: ChainId, to: string, amount: number) => Tx;
  receiveSimulate: (chain: ChainId, amount: number) => Tx;
  swap: (from: ChainId, to: ChainId, amountFrom: number) => Tx;
  buy: (chain: ChainId, usd: number) => Tx;

  bumpActivity: () => void;
}

const Ctx = createContext<WalletCtx | null>(null);

export function generateNew(words: 12 | 24) {
  return generateSeedPhrase(words === 24 ? 256 : 128);
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be inside <WalletProvider>");
  return ctx;
}

const SWAP_FEE = 0.003;  // 0.3 %
const BUY_SPREAD = 0.012; // 1.2 %

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [vault, setVault] = useState<Vault | null>(null);
  const [seed, setSeed] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<ChainId, number>>(store.getBalances());
  const [txs, setTxs] = useState<Tx[]>(store.getTxs());
  const [prices, setPrices] = useState<PriceMap>({
    prices: { BTC: 0, ETH: 0, SOL: 0, USDT: 1 },
    change24h: { BTC: 0, ETH: 0, SOL: 0, USDT: 0 },
  });

  const lockTimer = useRef<number | null>(null);

  // bootstrap
  useEffect(() => {
    const v = store.getVault();
    if (!v) setStatus("no-wallet");
    else {
      setVault(v);
      setStatus("locked");
    }
  }, []);

  // prices
  useEffect(() => {
    fetchPrices().then(setPrices);
    const i = window.setInterval(() => fetchPrices().then(setPrices), 60_000);
    return () => clearInterval(i);
  }, []);

  // auto-lock
  const resetLockTimer = useCallback(() => {
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    const mins = store.getSettings().autoLockMinutes;
    if (status === "unlocked" && mins > 0) {
      lockTimer.current = window.setTimeout(() => {
        setSeed(null);
        setStatus("locked");
      }, mins * 60_000);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "unlocked") return;
    resetLockTimer();
    const handler = () => resetLockTimer();
    ["mousemove", "keydown", "touchstart", "click"].forEach((e) => window.addEventListener(e, handler));
    return () => {
      ["mousemove", "keydown", "touchstart", "click"].forEach((e) => window.removeEventListener(e, handler));
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
  }, [status, resetLockTimer]);

  const addresses = useMemo(() => {
    const out = {} as Record<ChainId, string>;
    if (!seed) {
      CHAIN_LIST.forEach((c) => (out[c.id] = ""));
      return out;
    }
    const hex = seedToHex(seed);
    CHAIN_LIST.forEach((c) => (out[c.id] = deriveAddress(hex, c.id)));
    return out;
  }, [seed]);

  const totalUsd = useMemo(
    () =>
      CHAIN_LIST.reduce(
        (sum, c) => sum + (balances[c.id] ?? 0) * (prices.prices[c.id] ?? 0),
        0
      ),
    [balances, prices]
  );

  const persistTx = (tx: Tx) => {
    store.addTx(tx);
    setTxs(store.getTxs());
    // simulate confirmation after delay
    window.setTimeout(() => {
      store.updateTx(tx.id, { status: "confirmed" });
      setTxs(store.getTxs());
    }, 1800);
  };

  const setBal = (next: Record<ChainId, number>) => {
    store.setBalances(next);
    setBalances(next);
  };

  const value: WalletCtx = {
    status,
    vault,
    seed,
    addresses,
    balances,
    prices,
    txs,
    totalUsd,

    createWallet(phrase, pin, wordCount) {
      const cipher = encryptSeed(phrase, pin);
      const v: Vault = { cipher, wordCount, createdAt: Date.now(), backedUp: true };
      store.setVault(v);
      setVault(v);
      setSeed(phrase);
      setBal(seedDemoBalances());
      setStatus("unlocked");
    },
    importWallet(phrase, pin) {
      if (!isValidSeed(phrase)) return false;
      const wc: 12 | 24 = phrase.trim().split(/\s+/).length === 24 ? 24 : 12;
      const cipher = encryptSeed(phrase.trim().toLowerCase(), pin);
      const v: Vault = { cipher, wordCount: wc, createdAt: Date.now(), backedUp: true };
      store.setVault(v);
      setVault(v);
      setSeed(phrase.trim().toLowerCase());
      setBal(seedDemoBalances());
      setStatus("unlocked");
      return true;
    },
    unlock(pin) {
      const v = store.getVault();
      if (!v) return false;
      const phrase = decryptSeed(v.cipher, pin);
      if (!phrase) {
        store.setPinAttempts(store.getPinAttempts() + 1);
        return false;
      }
      store.setPinAttempts(0);
      setSeed(phrase);
      setVault(v);
      setStatus("unlocked");
      return true;
    },
    lock() {
      setSeed(null);
      setStatus("locked");
    },
    reset() {
      store.clearVault();
      setSeed(null);
      setVault(null);
      setBalances({ BTC: 0, ETH: 0, SOL: 0, USDT: 0 });
      setTxs([]);
      setStatus("no-wallet");
    },
    markBackedUp() {
      const v = store.getVault();
      if (!v) return;
      const next = { ...v, backedUp: true };
      store.setVault(next);
      setVault(next);
    },

    send(chain, to, amount) {
      const fee = amount * 0.0008;
      const next = { ...balances, [chain]: Math.max(0, balances[chain] - amount - fee) };
      setBal(next);
      const tx: Tx = {
        id: crypto.randomUUID(),
        chain, type: "send", amount, fee,
        usd: amount * (prices.prices[chain] ?? 0),
        status: "pending", timestamp: Date.now(), to,
      };
      persistTx(tx);
      return tx;
    },
    receiveSimulate(chain, amount) {
      const next = { ...balances, [chain]: balances[chain] + amount };
      setBal(next);
      const tx: Tx = {
        id: crypto.randomUUID(),
        chain, type: "receive", amount, fee: 0,
        usd: amount * (prices.prices[chain] ?? 0),
        status: "pending", timestamp: Date.now(),
      };
      persistTx(tx);
      return tx;
    },
    swap(from, to, amountFrom) {
      const fee = amountFrom * SWAP_FEE;
      const usdValue = (amountFrom - fee) * (prices.prices[from] ?? 0);
      const amountTo = (prices.prices[to] ?? 0) > 0 ? usdValue / prices.prices[to] : 0;
      const next = {
        ...balances,
        [from]: Math.max(0, balances[from] - amountFrom),
        [to]: balances[to] + amountTo,
      };
      setBal(next);
      const tx: Tx = {
        id: crypto.randomUUID(),
        chain: from, type: "swap", amount: amountFrom, fee,
        usd: amountFrom * (prices.prices[from] ?? 0),
        status: "pending", timestamp: Date.now(),
        meta: { to, amountTo, rate: (prices.prices[from] ?? 0) / (prices.prices[to] || 1) },
      };
      persistTx(tx);
      return tx;
    },
    buy(chain, usd) {
      const fee = usd * BUY_SPREAD;
      const credited = (usd - fee) / (prices.prices[chain] || 1);
      const next = { ...balances, [chain]: balances[chain] + credited };
      setBal(next);
      const tx: Tx = {
        id: crypto.randomUUID(),
        chain, type: "buy", amount: credited, fee,
        usd, status: "pending", timestamp: Date.now(),
      };
      persistTx(tx);
      return tx;
    },
    bumpActivity: resetLockTimer,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
