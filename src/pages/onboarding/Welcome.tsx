import { Button } from "@/components/ui/button";
import { SonderLogo } from "@/components/SonderLogo";
import { ShieldCheck, KeyRound, Sparkles, ArrowRight } from "lucide-react";

export function Welcome({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-foreground/5 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <SonderLogo size={44} withText />
          <span className="rounded-full border border-border/60 bg-surface/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Non-custodial
          </span>
        </header>

        <section className="mt-16 animate-fade-up">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Hold crypto<br />
            <span className="text-gradient">on your terms.</span>
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
            A premium multi-chain wallet. Generate keys locally, store them encrypted, and own every satoshi, gwei and lamport.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          {[
            { icon: ShieldCheck, t: "Self-custodial by design", d: "Keys never leave your device." },
            { icon: KeyRound, t: "BIP39 seed phrase", d: "Industry-standard recovery." },
            { icon: Sparkles, t: "Built-in swap & buy", d: "BTC, ETH, SOL, USDT in one tap." },
          ].map((f) => (
            <div key={f.t} className="glass flex items-start gap-4 rounded-2xl p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-dark">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{f.t}</div>
                <div className="text-sm text-muted-foreground">{f.d}</div>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-auto pt-10 space-y-3">
          <Button
            onClick={onCreate}
            className="group h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            Create new wallet
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={onImport}
            variant="ghost"
            className="h-12 w-full rounded-2xl border border-border bg-surface/40 text-foreground hover:bg-surface"
          >
            I already have a recovery phrase
          </Button>
          <p className="pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree that you alone are responsible for your seed phrase. Sonder cannot recover lost keys.
          </p>
        </div>
      </div>
    </main>
  );
}
