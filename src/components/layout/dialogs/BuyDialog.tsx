import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { useWallet } from "@/contexts/WalletContext";
import { CHAINS, ChainId, CHAIN_LIST } from "@/lib/wallet/crypto";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function BuyDialog({ chain, onClose }: { chain: ChainId | null; onClose: () => void }) {
  const { prices, buy } = useWallet();
  const [usd, setUsd] = useState("20");
  const [method, setMethod] = useState<"card" | "applepay">("card");
  const [target, setTarget] = useState<ChainId>(chain ?? "ETH");
  const [done, setDone] = useState(false);

  const amount = parseFloat(usd) || 0;
  const fee = amount * 0.012;
  const credited = useMemo(() => (amount - fee) / (prices.prices[target] || 1), [amount, fee, prices, target]);
  const tooSmall = amount < 2;

  const handle = () => {
    if (!target || tooSmall) return;
    buy(target, amount);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1600);
  };

  return (
    <Dialog open={!!chain} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Buy crypto</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="grid place-items-center py-10 animate-scale-in">
            <CheckCircle2 className="h-14 w-14 text-success" />
            <div className="mt-4 font-display text-xl">Purchase complete</div>
            <div className="text-sm text-muted-foreground">{credited.toFixed(6)} {CHAINS[target].symbol} added</div>
          </div>
        ) : (
          <>
            <div className="glass rounded-xl bg-surface/40 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">You spend</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold">$</span>
                <input
                  value={usd}
                  onChange={(e) => setUsd(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  className="flex-1 bg-transparent font-display text-3xl font-semibold outline-none"
                />
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[2, 20, 50, 100].map((p) => (
                  <button key={p} onClick={() => setUsd(String(p))} className="rounded-full border border-border bg-surface/40 px-3 py-1 text-xs hover:bg-surface">${p}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Asset</div>
              <div className="grid grid-cols-4 gap-2">
                {CHAIN_LIST.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTarget(c.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs ${target === c.id ? "border-foreground bg-surface-elevated" : "border-border bg-surface/40"}`}
                  >
                    <ChainIcon chain={c.id} size={28} />
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment method</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMethod("card")} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm ${method === "card" ? "border-foreground bg-surface-elevated" : "border-border bg-surface/40"}`}>
                  <CreditCard className="h-4 w-4" /> Debit card
                </button>
                <button onClick={() => setMethod("applepay")} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm ${method === "applepay" ? "border-foreground bg-surface-elevated" : "border-border bg-surface/40"}`}>
                  <Smartphone className="h-4 w-4" /> Apple Pay
                </button>
              </div>
            </div>

            <div className="glass space-y-1.5 rounded-xl p-3 text-sm">
              <Row label="Rate" value={`1 ${CHAINS[target].symbol} = $${prices.prices[target].toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <Row label="Sonder spread (1.2%)" value={`$${fee.toFixed(2)}`} />
              <Row label="You receive" value={`${credited.toFixed(6)} ${CHAINS[target].symbol}`} bold />
            </div>

            <Button
              disabled={tooSmall}
              onClick={() => { handle(); toast.success("Payment authorized"); }}
              className="h-12 w-full rounded-xl bg-gradient-primary font-semibold text-primary-foreground disabled:opacity-50"
            >
              {tooSmall ? "Minimum is $2" : `Buy ${CHAINS[target].symbol}`}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${bold ? "font-semibold text-foreground" : ""}`}>{value}</span>
    </div>
  );
}
