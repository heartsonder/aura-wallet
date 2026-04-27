import { useWallet } from "@/contexts/WalletContext";
import { CHAIN_LIST } from "@/lib/wallet/crypto";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { SonderLogo } from "@/components/SonderLogo";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Repeat, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SendDialog } from "../dialogs/SendDialog";
import { ReceiveDialog } from "../dialogs/ReceiveDialog";
import { BuyDialog } from "../dialogs/BuyDialog";
import { ChainId } from "@/lib/wallet/crypto";

export function HomeTab({ onOpenSwap }: { onOpenSwap: () => void }) {
  const { balances, prices, totalUsd } = useWallet();
  const [send, setSend] = useState<ChainId | null>(null);
  const [recv, setRecv] = useState<ChainId | null>(null);
  const [buy, setBuy] = useState<ChainId | null>(null);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  // weighted 24h change
  const weightedChange =
    totalUsd > 0
      ? CHAIN_LIST.reduce(
          (s, c) => s + ((balances[c.id] * prices.prices[c.id]) / totalUsd) * (prices.change24h[c.id] || 0),
          0
        )
      : 0;
  const positive = weightedChange >= 0;

  return (
    <>
      <header className="flex items-center justify-between">
        <SonderLogo size={40} withText />
        <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface/40 text-xs font-mono">
          A
        </button>
      </header>

      <section className="mt-8 animate-fade-up">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total balance</div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="font-display text-5xl font-semibold tracking-tight text-gradient">{fmt(totalUsd)}</div>
        </div>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-3 py-1 text-xs ${positive ? "text-success" : "text-destructive"}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? "+" : ""}{weightedChange.toFixed(2)}% · 24h
        </div>
      </section>

      <section className="mt-6 grid grid-cols-4 gap-2 animate-fade-up">
        {[
          { label: "Send", icon: ArrowUpRight, action: () => setSend("ETH") },
          { label: "Receive", icon: ArrowDownLeft, action: () => setRecv("ETH") },
          { label: "Swap", icon: Repeat, action: onOpenSwap },
          { label: "Buy", icon: CreditCard, action: () => setBuy("ETH") },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="glass group flex flex-col items-center gap-2 rounded-2xl py-4 transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-dark glow-ring">
              <a.icon className="h-4 w-4" />
            </div>
            <span className="text-xs">{a.label}</span>
          </button>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Assets</h2>
          <span className="text-xs text-muted-foreground">{CHAIN_LIST.length} tokens</span>
        </div>
        <div className="space-y-2">
          {CHAIN_LIST.map((c) => {
            const bal = balances[c.id] ?? 0;
            const price = prices.prices[c.id] ?? 0;
            const change = prices.change24h[c.id] ?? 0;
            const usd = bal * price;
            return (
              <button
                key={c.id}
                onClick={() => setSend(c.id)}
                className="glass flex w-full items-center gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <ChainIcon chain={c.id} size={44} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{c.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className={change >= 0 ? "text-success" : "text-destructive"}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {bal.toLocaleString(undefined, { maximumFractionDigits: 6 })} {c.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <SendDialog chain={send} onClose={() => setSend(null)} />
      <ReceiveDialog chain={recv} onClose={() => setRecv(null)} />
      <BuyDialog chain={buy} onClose={() => setBuy(null)} />
    </>
  );
}
