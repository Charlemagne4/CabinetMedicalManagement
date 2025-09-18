import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

import HomeNavbar from "../components/HomeNavbar";
import HomeSidebar from "../components/HomeSidebar";
import FilterSidebar from "../components/FilterSidebar";

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="">
      <SidebarProvider>
        <div className="w-full min-w-screen flex-col">
          <HomeNavbar />
          <div className="flex h-screen">
            <HomeSidebar />
            <main className="flex w-screen">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
export default MainLayout;
