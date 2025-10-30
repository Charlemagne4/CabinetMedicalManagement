import SectionHeader from "@/components/SectionHeader";
import { CreditCard } from "lucide-react";
import CreditSection from "../sections/CreditSection";

function creditsView() {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] min-w-full flex-col gap-y-6 px-4 pt-2.5">
      <SectionHeader
        icon={CreditCard}
        title="Crédits"
        description="Suivez et gérez les crédits attribués, les paiements en attente et les soldes restants."
      />
      <CreditSection />
    </div>
  );
}
export default creditsView;
