import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { store } from "@/lib/wallet/store";
import { ChevronRight, Shield, KeyRound, Fingerprint, Bell, Palette, Info, LogOut, Eye, EyeOff, Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SettingsTab() {
  const { lock, reset, seed, vault } = useWallet();
  const [settings, setSettings] = useState(store.getSettings());
  const [backup, setBackup] = useState(false);
  const [revealBackup, setRevealBackup] = useState(false);

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    store.setSettings(next);
  };

  return (
    <>
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Wallet security & preferences</p>
      </header>

      <Section title="Security">
        <Row icon={Shield} label="Backup wallet" onClick={() => setBackup(true)} hint={vault?.backedUp ? "Verified" : "Not verified"} />
        <Row icon={KeyRound} label="Change PIN" onClick={() => toast("Phase 2", { description: "PIN rotation coming soon." })} />
        <RowSwitch icon={Fingerprint} label="Biometric login" checked={settings.biometric} onChange={(v) => { update({ biometric: v }); v && toast("Biometric is simulated in Phase 1."); }} />
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Auto-lock after</span>
            <span className="font-mono text-muted-foreground">{settings.autoLockMinutes} min</span>
          </div>
          <Slider
            value={[settings.autoLockMinutes]}
            min={1}
            max={30}
            step={1}
            onValueChange={([v]) => update({ autoLockMinutes: v })}
          />
        </div>
      </Section>

      <Section title="Preferences">
        <RowSwitch icon={Bell} label="Notifications" checked={settings.notifications} onChange={(v) => update({ notifications: v })} />
        <Row icon={Palette} label="Theme" hint="Sonder Dark" />
      </Section>

      <Section title="About">
        <Row icon={Info} label="Version" hint="1.0.0 · Phase 1" />
      </Section>

      <Section title="Account">
        <Row icon={LogOut} label="Lock wallet" onClick={lock} />
        <Row
          icon={LogOut}
          label="Reset wallet"
          danger
          onClick={() => {
            if (confirm("Erase encrypted wallet from this device? Make sure you have your recovery phrase.")) reset();
          }}
        />
      </Section>

      <Dialog open={backup} onOpenChange={setBackup}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Recovery phrase</DialogTitle>
            <DialogDescription>Never share these words. Anyone with them controls your funds.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <div className={`grid grid-cols-2 gap-2 rounded-xl bg-surface/60 p-3 ${revealBackup ? "" : "blur-md select-none"}`}>
              {(seed?.split(" ") ?? []).map((w, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-background/40 px-3 py-2">
                  <span className="w-5 text-right font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <span className="font-mono text-sm">{w}</span>
                </div>
              ))}
            </div>
            {!revealBackup && (
              <button onClick={() => setRevealBackup(true)} className="absolute inset-0 grid place-items-center text-sm">
                <span className="rounded-full bg-surface-elevated px-4 py-2">Tap to reveal</span>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 rounded-xl border border-border" onClick={() => setRevealBackup((v) => !v)}>
              {revealBackup ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {revealBackup ? "Hide" : "Reveal"}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 rounded-xl border border-border"
              onClick={() => { navigator.clipboard.writeText(seed ?? ""); toast.success("Copied"); }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 px-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <div className="glass divide-y divide-border/40 overflow-hidden rounded-2xl">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, hint, onClick, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; hint?: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface/40">
      <Icon className={`h-5 w-5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
      <span className={`flex-1 text-sm ${danger ? "text-destructive" : ""}`}>{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function RowSwitch({ icon: Icon, label, checked, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
