import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { useWallet } from "@/contexts/WalletContext";
import { CHAINS, ChainId } from "@/lib/wallet/crypto";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function SendDialog({ chain, onClose }: { chain: ChainId | null; onClose: () => void }) {
  const { balances, prices, send } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");

  const num = parseFloat(amount) || 0;
  const usd = useMemo(() => (chain ? num * (prices.prices[chain] ?? 0) : 0), [num, chain, prices]);
  const fee = num * 0.0008;
  const bal = chain ? balances[chain] : 0;
  const insufficient = num + fee > bal;
  const valid = chain && to.length > 8 && num > 0 && !insufficient;

  const reset = () => { setTo(""); setAmount(""); setStep("form"); };

  return (
    <Dialog open={!!chain} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            {chain && <ChainIcon chain={chain} size={28} />}
            Send {chain && CHAINS[chain].symbol}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Recipient address</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x… / bc1q… / Solana address"
                className="glass w-full rounded-xl bg-surface/40 px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>Amount</span>
                <button onClick={() => setAmount(String(bal))} className="text-foreground">Max: {bal.toLocaleString(undefined, { maximumFractionDigits: 6 })}</button>
              </div>
              <div className="glass flex items-baseline gap-2 rounded-xl bg-surface/40 px-4 py-3">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/40"
                />
                <span className="text-sm text-muted-foreground">{chain && CHAINS[chain].symbol}</span>
              </div>
              <div className="mt-1 px-1 text-xs text-muted-foreground">≈ ${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>

            <div className="glass rounded-xl p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Network fee</span><span className="font-mono">{fee.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span></div>
            </div>

            <Button
              disabled={!valid}
              onClick={() => setStep("confirm")}
              className="h-12 w-full rounded-xl bg-gradient-primary font-semibold text-primary-foreground disabled:opacity-50"
            >
              {insufficient ? "Insufficient balance" : "Review"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <p className="text-xs text-muted-foreground">
                Crypto transactions are irreversible. Verify the recipient address carefully — funds sent to the wrong address are lost.
              </p>
            </div>
            <Detail label="To" value={to} mono />
            <Detail label="Amount" value={`${num} ${chain && CHAINS[chain].symbol}`} />
            <Detail label="USD value" value={`$${usd.toFixed(2)}`} />
            <Detail label="Network fee" value={`${fee.toFixed(6)} ${chain && CHAINS[chain].symbol}`} />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 rounded-xl border border-border" onClick={() => setStep("form")}>Back</Button>
              <Button
                onClick={() => {
                  if (!chain) return;
                  send(chain, to, num);
                  toast.success("Transaction sent");
                  reset(); onClose();
                }}
                className="flex-1 rounded-xl bg-gradient-primary font-semibold text-primary-foreground"
              >
                Confirm send
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${mono ? "font-mono break-all" : ""}`}>{value}</span>
    </div>
  );
}
