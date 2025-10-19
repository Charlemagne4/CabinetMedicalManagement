import { cn } from "@/lib/utils";
import type { Operation } from "@prisma/client";

interface OperationRowProps {
  entry: Operation;
}

function OperationRow({ entry }: OperationRowProps) {
  // si c'est une dépense -> signe négatif, sinon positif
  const isDepense = entry.type === "DEPENSE";
  const formattedAmount = `${isDepense ? "-" : "+"}${entry.amount.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "DZD",
    },
  )}`;

  return (
    <div className="grid grid-cols-[minmax(200px,400px)_1fr] gap-x-2 border-b py-2 md:grid-cols-4">
      {/* Label + badge */}
      <div className="flex items-center gap-2">
        <span className="truncate">{entry.label}</span>
        <p
          className={cn(
            "rounded px-2 py-0.5 text-xs font-semibold text-white",
            entry.type === "DEPENSE" && "bg-red-600",
            entry.type === "CONSULTATION" && "bg-green-600",
          )}
        >
          {entry.type}
        </p>
      </div>

      {/* Montant */}
      <div
        className={cn(
          "text-left font-semibold",
          isDepense ? "text-red-600" : "text-green-600",
        )}
      >
        {formattedAmount}
      </div>

      {/* Date */}
      <div className="text-left text-gray-500">
        {entry.date.toLocaleDateString("fr-FR")}
      </div>

      {/* User */}
      <div className="truncate text-gray-500">{entry.userId}</div>
    </div>
  );
}
export default OperationRow;
