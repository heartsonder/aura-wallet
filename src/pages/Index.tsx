import { useEffect, useState } from "react";
import { SonderLogo } from "@/components/SonderLogo";
import { useWallet } from "@/contexts/WalletContext";
import { Welcome } from "@/pages/onboarding/Welcome";
import { CreateWallet } from "@/pages/onboarding/CreateWallet";
import { ImportWallet } from "@/pages/onboarding/ImportWallet";
import { LockScreen } from "@/pages/LockScreen";
import { AppShell } from "@/components/layout/AppShell";

type OnboardingStep = "welcome" | "create" | "import";

const Index = () => {
  const { status } = useWallet();
  const [splash, setSplash] = useState(true);
  const [step, setStep] = useState<OnboardingStep>("welcome");

  useEffect(() => {
    const t = window.setTimeout(() => setSplash(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  if (splash || status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="animate-float">
            <SonderLogo size={88} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-gradient">Sonder</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">Your keys. Your crypto.</p>
          </div>
          <div className="mt-6 h-[2px] w-32 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-foreground/70 to-transparent" style={{ backgroundSize: "200% 100%" }} />
          </div>
        </div>
      </main>
    );
  }

  if (status === "no-wallet") {
    if (step === "create") return <CreateWallet onBack={() => setStep("welcome")} />;
    if (step === "import") return <ImportWallet onBack={() => setStep("welcome")} />;
    return <Welcome onCreate={() => setStep("create")} onImport={() => setStep("import")} />;
  }

  if (status === "locked") return <LockScreen />;

  return <AppShell />;
};

export default Index;
