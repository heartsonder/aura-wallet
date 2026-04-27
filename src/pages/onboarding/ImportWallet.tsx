import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { isValidSeed } from "@/lib/wallet/crypto";
import { PinInput } from "@/components/wallet/PinInput";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

export function ImportWallet({ onBack }: { onBack: () => void }) {
  const { importWallet } = useWallet();
  const [phrase, setPhrase] = useState("");
  const [stage, setStage] = useState<"phrase" | "pin">("phrase");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState(false);

  const cleaned = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  const wordCount = cleaned.split(" ").filter(Boolean).length;
  const valid = isValidSeed(cleaned);

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <button onClick={() => (stage === "pin" ? setStage("phrase") : onBack())} className="grid h-10 w-10 place-items-center rounded-full bg-surface/60">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Import wallet</div>
          <div className="w-10" />
        </div>

        {stage === "phrase" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">Enter your recovery phrase</h1>
            <p className="mt-3 text-sm text-muted-foreground">12 or 24 words, separated by spaces.</p>

            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="word one word two word three…"
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              className="glass mt-6 h-40 w-full rounded-2xl bg-surface/40 p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-foreground/20"
            />

            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">{wordCount} word{wordCount === 1 ? "" : "s"}</span>
              <span className={valid ? "text-success" : "text-muted-foreground"}>
                {phrase ? (valid ? "Valid phrase" : "Not a valid BIP39 phrase") : ""}
              </span>
            </div>

            <div className="mt-auto pt-8">
              <Button
                disabled={!valid}
                onClick={() => setStage("pin")}
                className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {stage === "pin" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight">
              {pin.length < 6 ? "Set a 6-digit PIN" : "Confirm your PIN"}
            </h1>
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
                    const ok = importWallet(cleaned, pin);
                    if (ok) toast.success("Wallet imported");
                    else toast.error("Could not import wallet");
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
