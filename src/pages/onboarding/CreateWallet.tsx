import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Copy, Eye, EyeOff, Shield } from "lucide-react";
import { generateSeedPhrase } from "@/lib/wallet/crypto";
import { PinInput } from "@/components/wallet/PinInput";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

type Stage = "warning" | "reveal" | "verify" | "pin";

export function CreateWallet({ onBack }: { onBack: () => void }) {
  const { createWallet } = useWallet();
  const [stage, setStage] = useState<Stage>("warning");
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [phrase] = useState(() => generateSeedPhrase(128));
  const [phrase24] = useState(() => generateSeedPhrase(256));
  const activePhrase = wordCount === 12 ? phrase : phrase24;
  const words = activePhrase.split(" ");

  const [revealed, setRevealed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);

  // verification
  const challenge = useMemo(() => {
    const idxs = new Set<number>();
    while (idxs.size < 3) idxs.add(Math.floor(Math.random() * words.length));
    return [...idxs].sort((a, b) => a - b);
  }, [words]);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const verified = challenge.every((i) => picks[i] === words[i]);

  const choicesFor = (correctIdx: number) => {
    const set = new Set<string>([words[correctIdx]]);
    while (set.size < 4) set.add(words[Math.floor(Math.random() * words.length)]);
    return [...set].sort();
  };

  const Header = (
    <div className="flex items-center justify-between">
      <button onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-surface/60 hover:bg-surface">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Create wallet</div>
      <div className="w-10" />
    </div>
  );

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        {Header}

        {stage === "warning" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <div className="mt-12 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-dark glow-ring">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Before we generate your keys</h1>
            <p className="mt-4 text-muted-foreground">
              You'll be shown a recovery phrase — the master key to your wallet. Anyone with it controls your funds. Anyone without it (including us) cannot help you recover.
            </p>

            <div className="mt-8 space-y-2">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Phrase length</div>
              <div className="grid grid-cols-2 gap-2">
                {[12, 24].map((n) => (
                  <button
                    key={n}
                    onClick={() => setWordCount(n as 12 | 24)}
                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                      wordCount === n ? "border-foreground bg-surface-elevated" : "border-border bg-surface/40 text-muted-foreground"
                    }`}
                  >
                    {n} words
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-10">
              <Button
                onClick={() => setStage("reveal")}
                className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow"
              >
                I understand, show me
              </Button>
            </div>
          </div>
        )}

        {stage === "reveal" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Your recovery phrase</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Write these {words.length} words down in order and store them somewhere safe and offline.
            </p>

            <div className="relative mt-6">
              <div className={`glass grid grid-cols-2 gap-2 rounded-2xl p-4 transition ${revealed ? "" : "blur-md select-none"}`}>
                {words.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-surface/60 px-3 py-2">
                    <span className="w-5 text-right font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <span className="font-mono text-sm">{w}</span>
                  </div>
                ))}
              </div>
              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="absolute inset-0 grid place-items-center rounded-2xl bg-background/40 text-sm font-medium hover:bg-background/30"
                >
                  <span className="flex items-center gap-2 rounded-full bg-surface-elevated px-4 py-2">
                    <Eye className="h-4 w-4" /> Tap to reveal
                  </span>
                </button>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setRevealed((v) => !v)}
                className="flex-1 rounded-xl border border-border bg-surface/40"
              >
                {revealed ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {revealed ? "Hide" : "Reveal"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(activePhrase);
                  toast.success("Copied to clipboard");
                }}
                className="flex-1 rounded-xl border border-border bg-surface/40"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>

            <div className="mt-auto pt-8">
              <Button
                disabled={!revealed}
                onClick={() => setStage("verify")}
                className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                I've written it down
              </Button>
            </div>
          </div>
        )}

        {stage === "verify" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Verify your phrase</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Tap the correct word for each position to confirm you've saved it.
            </p>

            <div className="mt-8 space-y-6">
              {challenge.map((idx) => (
                <div key={idx}>
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Word #{idx + 1}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {choicesFor(idx).map((w) => {
                      const selected = picks[idx] === w;
                      const correct = picks[idx] && w === words[idx];
                      return (
                        <button
                          key={w}
                          onClick={() => setPicks((p) => ({ ...p, [idx]: w }))}
                          className={`rounded-xl border px-4 py-3 text-sm font-mono transition ${
                            selected
                              ? correct
                                ? "border-success/60 bg-success/10 text-foreground"
                                : "border-destructive/60 bg-destructive/10"
                              : "border-border bg-surface/40 hover:bg-surface"
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <Button
                disabled={!verified}
                onClick={() => setStage("pin")}
                className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {verified ? <><Check className="mr-2 h-4 w-4" /> Continue</> : "Pick the correct words"}
              </Button>
            </div>
          </div>
        )}

        {stage === "pin" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">
              {pin.length < 6 ? "Set a 6-digit PIN" : "Confirm your PIN"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Used to unlock the app and decrypt your seed locally.
            </p>
            <div className="mt-12">
              {pin.length < 6 ? (
                <PinInput value={pin} onChange={setPin} autoFocus />
              ) : (
                <PinInput
                  value={pinConfirm}
                  onChange={setPinConfirm}
                  autoFocus
                  error={pinError}
                  onComplete={(v) => {
                    if (v !== pin) {
                      setPinError(true);
                      setTimeout(() => { setPinConfirm(""); setPinError(false); }, 600);
                      toast.error("PINs don't match");
                      return;
                    }
                    createWallet(activePhrase, pin, wordCount);
                    toast.success("Wallet created");
                  }}
                />
              )}
            </div>
            {pin.length === 6 && (
              <button onClick={() => { setPin(""); setPinConfirm(""); }} className="mx-auto mt-6 text-xs text-muted-foreground underline">
                Change PIN
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
