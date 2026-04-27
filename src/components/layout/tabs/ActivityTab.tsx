import { useWallet } from "@/contexts/WalletContext";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { CHAINS } from "@/lib/wallet/crypto";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Repeat, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Tx } from "@/lib/wallet/store";
import { useState } from "react";

const ICONS = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  swap: Repeat,
  buy: CreditCard,
};

export function ActivityTab() {
  const { txs } = useWallet();
  const [filter, setFilter] = useState<"all" | Tx["type"]>("all");
  const filtered = filter === "all" ? txs : txs.filter((t) => t.type === filter);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every transaction across your wallet</p>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {(["all", "send", "receive", "swap", "buy"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition ${
              filter === f ? "border-foreground bg-surface-elevated text-foreground" : "border-border bg-surface/40 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No transactions yet. Send, receive, swap or buy to see activity here.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((tx) => {
            const Icon = ICONS[tx.type];
            return (
              <div key={tx.id} className="glass flex items-center gap-3 rounded-2xl p-4 animate-fade-in">
                <div className="relative">
                  <ChainIcon chain={tx.chain} size={40} />
                  <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-background">
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium capitalize">
                    {tx.type} {tx.type === "swap" && tx.meta?.to ? `→ ${(tx.meta.to as string)}` : CHAINS[tx.chain].symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {tx.type === "send" || tx.type === "swap" ? "−" : "+"}
                    {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </div>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: Tx["status"] }) {
  if (status === "pending") return <span className="inline-flex items-center gap-1 text-[10px] text-warning"><Loader2 className="h-3 w-3 animate-spin" />Pending</span>;
  if (status === "failed") return <span className="inline-flex items-center gap-1 text-[10px] text-destructive"><XCircle className="h-3 w-3" />Failed</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] text-success"><CheckCircle2 className="h-3 w-3" />Confirmed</span>;
}
