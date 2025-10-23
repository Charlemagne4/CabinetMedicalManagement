"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntryType } from "@prisma/client";
import ConsultationForm from "./Forms/ConsultationForm";
import DepenseForm from "./Forms/DepenseForm";
import type { api } from "@/trpc/react";

export interface EntryFormsProps {
  create: ReturnType<typeof api.entries.create.useMutation>;
}

export default function EntryForms({ create }: EntryFormsProps) {
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
        <ConsultationForm create={create} />
      </TabsContent>

      <TabsContent value={EntryType.DEPENSE}>
        <DepenseForm create={create} />
      </TabsContent>
    </Tabs>
  );
}
