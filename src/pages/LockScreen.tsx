import { useState } from "react";
import { SonderLogo } from "@/components/SonderLogo";
import { PinInput } from "@/components/wallet/PinInput";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";

export function LockScreen() {
  const { unlock, reset } = useWallet();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-10">
        <div className="mt-16 animate-float">
          <SonderLogo size={72} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your PIN to unlock Sonder</p>

        <div className="mt-12">
          <PinInput
            value={pin}
            onChange={setPin}
            autoFocus
            error={error}
            onComplete={(v) => {
              const ok = unlock(v);
              if (!ok) {
                setError(true);
                setTimeout(() => { setPin(""); setError(false); }, 700);
                toast.error("Incorrect PIN");
              }
            }}
          />
        </div>

        <button
          onClick={() => toast("Biometric login is a Phase 2 feature", { description: "WebAuthn / Passkeys coming soon." })}
          className="mt-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Fingerprint className="h-4 w-4" /> Use biometrics
        </button>

        <div className="mt-auto pt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("This will erase the encrypted wallet on this device. Make sure you have your recovery phrase.")) {
                reset();
              }
            }}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Forgot PIN — reset wallet
          </Button>
        </div>
      </div>
    </main>
  );
}
