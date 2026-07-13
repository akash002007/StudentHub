import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopNav, DashboardTopNavDesktop } from "@/components/dashboard/DashboardTopNav";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-background text-foreground selection:bg-royal-purple/30 relative transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex flex-col h-screen relative z-10">
        
        {/* Top Navigation */}
        <DashboardTopNav />
        <DashboardTopNavDesktop />

        {/* Page Content - Messages workspace uses full height */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>

        {/* Bottom Navigation (Mobile) */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
