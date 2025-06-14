"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IUser } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * A factory function that generates the column definitions for the user data table.
 * This approach allows for injecting action handlers (like `onRoleChange`) from the parent
 * component, keeping the column definitions decoupled from the state management logic.
 *
 * @param {(userId: string, role: "user" | "admin") => void} onRoleChange - A callback function to handle changing a user's role.
 * @returns {ColumnDef<IUser>[]} An array of column definitions for `@tanstack/react-table`.
 */
export const columns = (
  onRoleChange: (userId: string, role: "user" | "admin") => void
): ColumnDef<IUser>[] => [
  {
    /**
     * Defines the 'Customer' column, which displays a composite of the user's
     * avatar, name, and email for easy identification.
     */
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={row.original.image ?? undefined}
            alt={row.original.name}
          />
          <AvatarFallback>
            {/* Display the first initial of the user's name as a fallback. */}
            {row.original.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          {/* TODO: Add a link from the user's name to a detailed user profile/management page. */}
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    /**
     * Defines the 'Role' column, using a Badge for visual distinction
     * between different user roles.
     */
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    /**
     * Defines the 'Joined On' column, displaying the date the user account
     * was created.
     */
    // TODO: Implement sorting for this column in the parent data table component to allow admins to find the newest or oldest users.
    accessorKey: "createdAt",
    header: "Joined On",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    /**
     * Defines a custom 'Actions' column that does not map to a specific data key.
     * It provides a dropdown menu for performing actions on each user row.
     */
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      // Determine the new role for the "Make..." action.
      const newRole = user.role === "admin" ? "user" : "admin";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onRoleChange(user._id.toString(), newRole)}
            >
              Make {newRole.charAt(0).toUpperCase() + newRole.slice(1)}
            </DropdownMenuItem>
            {/* TODO: Implement a "Delete User" action. This should trigger a confirmation dialog to prevent accidental deletion.
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
            */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
