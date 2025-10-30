import { Users } from "lucide-react";
import AddUserFormModal from "../components/AddUserFormModal";
import UsersSection from "../Sections/UsersSection";
import SectionHeader from "@/components/SectionHeader";

function UsersView() {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] min-w-full flex-col gap-y-6 px-4 pt-2.5">
      <div className="flex justify-between">
        <SectionHeader
          icon={Users}
          title="Utilisateurs"
          description="Gérez les comptes et statuts des utilisateurs."
        />
        <AddUserFormModal />
      </div>
      <UsersSection />
    </div>
  );
}
export default UsersView;
