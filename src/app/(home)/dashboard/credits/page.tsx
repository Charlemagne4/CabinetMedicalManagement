import SectionHeader from "@/components/SectionHeader";
import { CreditCard } from "lucide-react";

function page() {
  return (
    <div>
      <SectionHeader
        icon={CreditCard}
        title="Crédits"
        description="Suivez et gérez les crédits attribués, les paiements en attente et les soldes restants."
      />
    </div>
  );
}
export default page;
