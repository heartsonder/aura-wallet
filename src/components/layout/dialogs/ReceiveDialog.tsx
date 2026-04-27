import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChainIcon } from "@/components/wallet/ChainIcon";
import { useWallet } from "@/contexts/WalletContext";
import { CHAINS, ChainId } from "@/lib/wallet/crypto";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export function ReceiveDialog({ chain, onClose }: { chain: ChainId | null; onClose: () => void }) {
  const { addresses, receiveSimulate } = useWallet();
  const addr = chain ? addresses[chain] : "";

  return (
    <Dialog open={!!chain} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-3">
            {chain && <ChainIcon chain={chain} size={28} />}
            Receive {chain && CHAINS[chain].symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="grid place-items-center">
          <div className="rounded-2xl bg-foreground p-4">
            <QRCodeSVG value={addr} size={196} bgColor="transparent" fgColor="#0a0b0d" level="M" />
          </div>
        </div>

        <div className="glass rounded-xl bg-surface/40 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your {chain} address</div>
          <div className="mt-1 break-all font-mono text-sm">{addr}</div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl border border-border"
            onClick={() => { navigator.clipboard.writeText(addr); toast.success("Address copied"); }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button
            className="flex-1 rounded-xl bg-gradient-primary font-semibold text-primary-foreground"
            onClick={() => {
              if (!chain) return;
              const amt = chain === "BTC" ? 0.001 : chain === "ETH" ? 0.05 : chain === "SOL" ? 1 : 25;
              receiveSimulate(chain, amt);
              toast.success(`Simulated incoming ${amt} ${CHAINS[chain].symbol}`);
              onClose();
            }}
          >
            Simulate inbound
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
