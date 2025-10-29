import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import MainFeaturesSection from "../sections/MainFeaturesSection";

function HomeSidebar() {
  return (
    <Sidebar collapsible="icon" className="z-40 border-none pt-16">
      <SidebarContent>
        <MainFeaturesSection />
      </SidebarContent>
    </Sidebar>
  );
}
export default HomeSidebar;
