import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CHAIN_LIST, ChainId, shortAddr } from "@/lib/wallet/crypto";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { ArrowDownLeft, ArrowUpRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { SendDialog } from "../dialogs/SendDialog";
import { ReceiveDialog } from "../dialogs/ReceiveDialog";

export function WalletsTab() {
  const { balances, prices, addresses } = useWallet();
  const [send, setSend] = useState<ChainId | null>(null);
  const [recv, setRecv] = useState<ChainId | null>(null);

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Wallets</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your addresses across chains</p>
      </header>

      <div className="mt-6 space-y-3">
        {CHAIN_LIST.map((c) => {
          const addr = addresses[c.id];
          const bal = balances[c.id] ?? 0;
          const usd = bal * (prices.prices[c.id] ?? 0);
          return (
            <div key={c.id} className="glass rounded-2xl p-5 animate-fade-up">
              <div className="flex items-center gap-4">
                <ChainIcon chain={c.id} size={44} />
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{bal.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                  <div className="text-xs text-muted-foreground">${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>

              <button
                onClick={() => { navigator.clipboard.writeText(addr); toast.success("Address copied"); }}
                className="mt-4 flex w-full items-center justify-between rounded-xl bg-surface/60 px-3 py-2 text-left hover:bg-surface"
              >
                <span className="font-mono text-xs text-muted-foreground">{shortAddr(addr, 10, 8)}</span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSend(c.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 py-2.5 text-sm hover:bg-surface"
                >
                  <ArrowUpRight className="h-4 w-4" /> Send
                </button>
                <button
                  onClick={() => setRecv(c.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 py-2.5 text-sm hover:bg-surface"
                >
                  <ArrowDownLeft className="h-4 w-4" /> Receive
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SendDialog chain={send} onClose={() => setSend(null)} />
      <ReceiveDialog chain={recv} onClose={() => setRecv(null)} />
    </>
  );
}
