import type { ReactNode } from "react";
import HomeNavbar from "../components/HomeNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <SidebarProvider>navbar + side bar</SidebarProvider>
      {/* <HomeNavbar /> */}
    </div>
  );
}
export default MainLayout;
