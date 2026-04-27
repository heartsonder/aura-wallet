import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { CHAIN_LIST, ChainId, CHAINS } from "@/lib/wallet/crypto";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SwapTab() {
  const { balances, prices, swap } = useWallet();
  const [from, setFrom] = useState<ChainId>("ETH");
  const [to, setTo] = useState<ChainId>("USDT");
  const [amount, setAmount] = useState("");

  const num = parseFloat(amount) || 0;
  const fee = num * 0.003;
  const rate = useMemo(() => {
    const pf = prices.prices[from] || 0;
    const pt = prices.prices[to] || 1;
    return pf / pt;
  }, [from, to, prices]);
  const receive = (num - fee) * rate;
  const fromBal = balances[from] ?? 0;
  const insufficient = num > fromBal;

  const swapAssets = () => { setFrom(to); setTo(from); };

  const Selector = ({
    side, value, onChange, balance,
  }: { side: "from" | "to"; value: ChainId; onChange: (c: ChainId) => void; balance?: number }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="glass relative rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{side === "from" ? "You pay" : "You receive"}</span>
          {balance !== undefined && (
            <span className="text-xs text-muted-foreground">
              Balance: <span className="font-mono">{balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {side === "from" ? (
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="flex-1 bg-transparent font-display text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
            />
          ) : (
            <div className="flex-1 truncate font-display text-3xl font-semibold tracking-tight text-muted-foreground">
              {receive ? receive.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0.00"}
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2 hover:bg-surface"
          >
            <ChainIcon chain={value} size={24} />
            <span className="text-sm font-medium">{CHAINS[value].symbol}</span>
          </button>
        </div>

        {open && (
          <div className="absolute right-4 top-full z-30 mt-2 w-48 rounded-xl border border-border bg-popover p-1 shadow-elevated">
            {CHAIN_LIST.filter((c) => c.id !== value).map((c) => (
              <button
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface"
              >
                <ChainIcon chain={c.id} size={24} />
                <span className="text-sm">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Swap</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trade between chains in seconds</p>
      </header>

      <div className="mt-6 space-y-2">
        <Selector side="from" value={from} onChange={(c) => { if (c === to) setTo(from); setFrom(c); }} balance={fromBal} />
        <div className="relative -my-4 grid place-items-center">
          <button
            onClick={swapAssets}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background hover:rotate-180 hover:bg-surface transition"
            aria-label="Swap direction"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
        <Selector side="to" value={to} onChange={(c) => { if (c === from) setFrom(to); setTo(c); }} />
      </div>

      <div className="glass mt-4 space-y-2 rounded-2xl p-4 text-sm">
        <Row label="Rate" value={`1 ${CHAINS[from].symbol} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${CHAINS[to].symbol}`} />
        <Row label="Network fee" value="~ $0.42" />
        <Row label="Sonder fee (0.3%)" value={`${fee.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${CHAINS[from].symbol}`} />
        <Row label="You receive" value={`${receive.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${CHAINS[to].symbol}`} bold />
      </div>

      <Button
        disabled={!num || insufficient}
        onClick={() => {
          swap(from, to, num);
          toast.success(`Swapped ${num} ${CHAINS[from].symbol} → ${CHAINS[to].symbol}`);
          setAmount("");
        }}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
      >
        {!num ? "Enter amount" : insufficient ? "Insufficient balance" : "Review & swap"}
      </Button>
    </>
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
