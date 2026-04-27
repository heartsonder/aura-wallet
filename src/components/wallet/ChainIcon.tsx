import { cn } from "@/lib/utils";
import { CHAINS, ChainId } from "@/lib/wallet/crypto";

export function ChainIcon({ chain, size = 36, className }: { chain: ChainId; size?: number; className?: string }) {
  const c = CHAINS[chain];
  // Minimalist monogram coin
  return (
    <div
      className={cn("relative grid place-items-center rounded-full font-mono font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c.color}cc, ${c.color}77)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px ${c.color}33`,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {c.symbol === "USDT" ? "₮" : c.symbol[0]}
    </div>
  );
}
