import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import MainFeaturesSection from "../sections/MainFeaturesSection";

function HomeSidebar() {
  return (
    <div>
      <Sidebar collapsible="none" className="w-15">
        <SidebarContent>
          <MainFeaturesSection />
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
export default HomeSidebar;
