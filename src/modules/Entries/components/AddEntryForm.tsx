"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntryType } from "@prisma/client";
import ConsultationForm from "./Forms/ConsultationForm";
import DepenseForm from "./Forms/DepenseForm";

export default function EntryForms() {
  return (
    <Tabs
      orientation="vertical"
      defaultValue={EntryType.CONSULTATION}
      className="w-full items-center justify-center space-y-6"
    >
      {/* Buttons */}
      <TabsList>
        {Object.values(EntryType).map((type) => (
          <TabsTrigger key={type} value={type}>
            {type}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Forms */}
      <TabsContent value={EntryType.CONSULTATION}>
        <ConsultationForm />
      </TabsContent>
      <TabsContent value={EntryType.BILAN}>
        <BilanForm />
      </TabsContent>
      <TabsContent value={EntryType.CREDIT}>
        <CreditForm />
      </TabsContent>
      <TabsContent value={EntryType.DEPENSE}>
        <DepenseForm shiftId={""} />
      </TabsContent>
    </Tabs>
  );
}

/* Example forms */

function BilanForm() {
  return <p className="rounded border p-4">Bilan Form</p>;
}
function CreditForm() {
  return <p className="rounded border p-4">Credit Form</p>;
}
