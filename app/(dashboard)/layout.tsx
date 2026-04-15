import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-bg overflow-hidden">
      {/* PANEL KIRI: SIDEBAR (Fixed Width) */}
      <Sidebar />

      {/* AREA KANAN: Ini bakal diisi Chat + Right Panel */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}