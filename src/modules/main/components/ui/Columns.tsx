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
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type entry = Prisma.OperationGetPayload<{
  include: {
    consultation: { include: { credit: true } };
    user: { select: { name: true; role: true; email: true; id: true } };
  };
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
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const entry = row.original;
      const entryType: EntryType = entry.type;
      const entryLabel: string = entry.label;
      return (
        <div className="flex items-center gap-2 truncate">
          <span className="truncate">{entryLabel}</span>

          <Badge
            className={cn(
              (() => {
                if (entry.consultation?.type === "BILAN") return "bg-blue-600";
                if (entry.consultation?.type === "CONSULTATION")
                  return "bg-green-600";
                return "bg-red-600";
              })(), // 👈 function is immediately called
            )}
          >
            {entry.consultation?.type ?? entryType}
          </Badge>
          {entry.consultation?.credit?.isPaid === false && (
            <Badge className="bg-yellow-500">Credit</Badge>
          )}
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
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
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
            (() => {
              if (entry.consultation?.credit?.isPaid === false)
                return "text-yellow-500";
              const color = isDepense ? "text-red-600" : "text-green-600";
              return color;
            })(),
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
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
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
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
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
    id: "action",
    cell: ({ row }) => {
      const entry = row.original;
      const credit = entry.consultation?.credit;
      const utils = api.useUtils();

      const payCredit = api.entries.payCredit.useMutation({
        onSuccess: async ({ shiftId, message }) => {
          toast.success(message);
          await utils.entries.getMany.invalidate();
          await utils.shifts.getMany.invalidate({});

          await utils.shifts.getShiftOperations.invalidate({ shiftId });
        },
        onError: (err) => {
          toast.error(err.message);
        },
      });
      const switchToCredit = api.entries.switchToCredit.useMutation({
        onSuccess: async ({ shiftId, message }) => {
          toast.success(message);
          await utils.entries.getMany.invalidate();
          await utils.shifts.getMany.invalidate({});
          await utils.shifts.getShiftOperations.invalidate({ shiftId });
        },
        onError: (err) => {
          toast.error(err.message);
        },
      });

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
            {credit && !credit.isPaid && (
              <DropdownMenuItem
                onClick={() => payCredit.mutate({ creditId: credit.id })}
              >
                💰 Pay Credit
              </DropdownMenuItem>
            )}
            {(!credit || credit.isPaid) && (
              <DropdownMenuItem
                onClick={() => {
                  switchToCredit.mutate({
                    consultationId: entry.consultationId,
                  });
                }}
              >
                💳 Switch to Credit
              </DropdownMenuItem>
            )}
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
