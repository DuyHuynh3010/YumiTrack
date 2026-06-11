import { AppShell } from "@/components/AppShell";
import { PracticeBuilder } from "@/components/PracticeBuilder";

export default function PracticePage() {
  return (
    <AppShell activePath="/practice">
      <header className="topbar">
        <div>
          <p className="eyebrow">Practice input</p>
          <h1>Record 4-arrow ends</h1>
        </div>
      </header>

      <div style={{ marginTop: 32 }}>
        <PracticeBuilder />
      </div>
    </AppShell>
  );
}
