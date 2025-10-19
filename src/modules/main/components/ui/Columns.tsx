"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";
import { logger } from "@/utils/pino";
import type { EntryType, Prisma } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type entry = Prisma.OperationGetPayload<{
  include: { user: true };
}>;

// export type entry = {
//   id: string;
//   amount: number;
//   label: string;
//   type: EntryType;
//   date: Date;
//   userId: string | null;
// };

export const columns: ColumnDef<entry>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Entrée
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const entryType: EntryType = row.getValue("type");
      const entryLabel: string = row.getValue("label");
      return (
        <div className="flex items-center gap-2">
          <span className="truncate">{entryLabel}</span>
          <p
            className={cn(
              "rounded px-2 py-0.5 text-xs font-semibold text-white",
              entryType === "DEPENSE" && "bg-red-600",
              entryType === "CONSULTATION" && "bg-green-600",
            )}
          >
            {entryType}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Montant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const entry = row.original;
      const isDepense = entry.type === "DEPENSE";
      const formattedAmount = `${isDepense ? "-" : "+"}${entry.amount.toLocaleString(
        "fr-FR",
        {
          style: "currency",
          currency: "DZD",
        },
      )}`;
      return (
        <div
          className={cn(
            "text-left font-semibold",
            isDepense ? "text-red-600" : "text-green-600",
          )}
        >
          {formattedAmount}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date: Date = row.getValue("date");
      const formatedDate = date.toLocaleString("fr-FR");
      return <div className="text-left">{formatedDate}</div>;
    },
  },
  {
    accessorKey: "userId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Utilisateur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const entry = row.original;
      logger.debug(entry);
      return <div className="truncate">{entry.user?.name}</div>;
    },
  },
  {
    accessorKey: "type",
    header: undefined,
    cell: undefined,
  },
  {
    id: "action",
    cell: ({ row }) => {
      const entry = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions (Work in Progress)</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(entry.label)}
            >
              Copy Name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>switch to Credit</DropdownMenuItem>
            <DropdownMenuItem>pay</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="p-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
