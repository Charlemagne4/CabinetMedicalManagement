import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

import HomeNavbar from "../components/HomeNavbar";
import HomeSidebar from "../components/HomeSidebar";
import FilterSidebar from "../components/FilterSidebar";

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <SidebarProvider>
        <div className="sticky w-full flex-col">
          <HomeNavbar />
          <div className="sticky flex">
            <HomeSidebar />
            <FilterSidebar />
            <main className="flex">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
export default MainLayout;
