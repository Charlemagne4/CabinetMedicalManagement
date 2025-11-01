"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Prisma } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  MoreHorizontal,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import ResetUserPasswordModal from "@/modules/users/components/ResetUserPasswordModal";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type entry = Prisma.UserGetPayload<{
  include: { _count: { select: { Operation: true } }; ShiftTemplates: true };
  omit: {
    password: true;
    emailVerified: true;

    salt: true;
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

export const UsersColumn: ColumnDef<entry>[] = [
  {
    accessorKey: "label",
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
      return <span> {entry?.name}</span>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
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
      return <span>{entry.email}</span>;
    },
  },
  {
    accessorKey: "activated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Activé
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
      return <span>{entry.activated ? "Oui" : "Non"}</span>;
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
      const entry = row.original;
      const date: Date = entry.createdAt;
      const formatedDate = date.toLocaleString("fr-FR");
      return <div className="text-left">{formatedDate}</div>;
    },
  },
  {
    accessorKey: "operations",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Operations Introduit
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
      return (
        <div className="mr-10 truncate text-right">
          {entry._count.Operation}
        </div>
      );
    },
  },
  {
    id: "shift",
    header: "Shifts",
    cell: ({ row }) => {
      const entry = row.original;
      const shifts = entry.ShiftTemplates.map(
        (ShiftType) => ShiftType.type,
      ).join("/");

      return <span className="mr-10">{shifts}</span>;
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const entry = row.original;
      const utils = api.useUtils();

      const switchUser = api.users.switchActivate.useMutation({
        onSuccess: async ({ activated, name }) => {
          toast.success(`${name} ${activated ? "Activé" : "Désactivé"}`);
          await utils.users.getMany.invalidate();
        },
        onError: (err) => {
          toast.error(err.message);
        },
      });
      const assignShift = api.users.assignshift.useMutation({
        onSuccess: async () => {
          // toast.success(`${name} ${activated ? "Activé" : "Désactivé"}`);
          await utils.users.getMany.invalidate();
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
              onClick={() =>
                entry.email && navigator.clipboard.writeText(entry.email)
              }
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Assigner Shift</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() =>
                      assignShift.mutate({ type: "MATIN", userId: entry.id })
                    }
                  >
                    Matin
                    {entry.ShiftTemplates?.find((a) => a.type === "MATIN") && (
                      <Check />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      assignShift.mutate({ type: "SOIR", userId: entry.id })
                    }
                  >
                    Soir
                    {entry.ShiftTemplates?.find((a) => a.type === "SOIR") && (
                      <Check />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <ResetUserPasswordModal userId={entry.id} />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => switchUser.mutate({ userId: entry.id })}
            >
              {!entry.activated ? "Activer" : "Désactiver"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="p-2">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
];
