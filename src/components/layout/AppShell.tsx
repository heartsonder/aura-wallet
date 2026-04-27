import { useState } from "react";
import { Home, Wallet, Repeat, Activity, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomeTab } from "./tabs/HomeTab";
import { WalletsTab } from "./tabs/WalletsTab";
import { SwapTab } from "./tabs/SwapTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { SettingsTab } from "./tabs/SettingsTab";

type Tab = "home" | "wallets" | "swap" | "activity" | "settings";

const NAV: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "swap", label: "Swap", icon: Repeat },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-gradient-glow" />
      <main className="relative mx-auto w-full max-w-md px-5 pb-32 pt-6">
        <div key={tab} className="animate-fade-in">
          {tab === "home" && <HomeTab onOpenSwap={() => setTab("swap")} />}
          {tab === "wallets" && <WalletsTab />}
          {tab === "swap" && <SwapTab />}
          {tab === "activity" && <ActivityTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl glass-strong px-2 py-2">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium uppercase tracking-wider transition",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-dark glow-ring" />
                )}
                <n.icon className={cn("relative h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]")} />
                <span className="relative">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
