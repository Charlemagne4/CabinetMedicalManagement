import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import FilterFeaturesSection from "../sections/FilterFeaturesSection";

function FilterSidebar() {
  return (
    <div>
      <Sidebar collapsible="none" className="bg-sidebar-accent min-h-screen">
        <SidebarContent>
          <FilterFeaturesSection />
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
export default FilterSidebar;
