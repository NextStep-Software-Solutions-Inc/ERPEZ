import type { ColumnDef } from "erpez-shared-lib";
import { ArrowUpDown, MoreHorizontal, Shield, UserCheck, UserX, Trash2, Ban, Eye, Edit2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type TenantMember } from "./types";

export interface MemberActionHandlers {
    onViewDetails?: (member: TenantMember) => void;
    onEditMember?: (member: TenantMember) => void;
    onEditRoles?: (member: TenantMember) => void;
    onToggleStatus?: (member: TenantMember) => void;
    onRevokeInvitation?: (member: TenantMember) => void;
    onDelete?: (member: TenantMember) => void;
    currentUserId?: string;
    currentUserEmail?: string;
    canManage?: boolean;
}

export function createColumns(handlers?: MemberActionHandlers): ColumnDef<TenantMember>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
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
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const member = row.original;
                const initials = member.name
                    ? member.name
                        .split(" ")
                        .map((p) => p[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U";
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-900 leading-tight text-xs">{member.name}</span>
                            {member.firstName && member.lastName && (
                                <span className="text-[11px] text-muted-foreground">{member.firstName} {member.lastName}</span>
                            )}
                        </div>
                    </div>
                );
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true;
                const search = String(filterValue).toLowerCase();
                const name = (row.original.name || "").toLowerCase();
                const email = (row.original.email || "").toLowerCase();
                const first = (row.original.firstName || "").toLowerCase();
                const last = (row.original.lastName || "").toLowerCase();
                return name.includes(search) || email.includes(search) || first.includes(search) || last.includes(search);
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "roles",
            header: "Workspace Roles",
            cell: ({ row }) => {
                const roles = row.original.roles && row.original.roles.length > 0
                    ? row.original.roles
                    : row.original.role ? [row.original.role] : ["End User"];
                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map((r, idx) => {
                            const isWorkspaceAdmin = r === "Tenant Administrator" || r === "Workspace Administrator";
                            const displayRole = r === "Tenant Administrator" ? "Workspace Administrator" : r;
                            return (
                                <Badge
                                    key={idx}
                                    variant={isWorkspaceAdmin ? "default" : "secondary"}
                                    className={`text-xs ${isWorkspaceAdmin ? "bg-slate-900 text-white hover:bg-slate-800" : ""}`}
                                >
                                    {displayRole}
                                </Badge>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.original.status;
                let badgeClass = "bg-gray-100 text-gray-800 border-gray-200";
                if (status === "Active") {
                    badgeClass = "bg-green-100 text-green-800 border-green-200";
                } else if (status === "Pending") {
                    badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                } else if (status === "Disabled") {
                    badgeClass = "bg-red-100 text-red-800 border-red-200";
                } else if (status === "Cancelled") {
                    badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
                }

                return (
                    <div className="flex flex-col items-start gap-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}>
                            {status}
                        </span>
                        {status === "Pending" && row.original.invitationExpiresAtUtc && (
                            <span className="text-[10px] text-muted-foreground">
                                Exp: {new Date(row.original.invitationExpiresAtUtc).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                );
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue || filterValue === "All") return true;
                return String(row.original.status).toLowerCase() === String(filterValue).toLowerCase();
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const member = row.original;
                const isSelf = Boolean(
                    (handlers?.currentUserId && (member.id === handlers.currentUserId || member.userId === handlers.currentUserId || member.externalIdentityId === handlers.currentUserId)) ||
                    (handlers?.currentUserEmail && member.email?.toLowerCase() === handlers.currentUserEmail.toLowerCase())
                );

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => handlers?.onViewDetails?.(member)}
                                className="cursor-pointer"
                            >
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                View Details
                            </DropdownMenuItem>

                            {handlers?.canManage !== false && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handlers?.onEditMember?.(member)}
                                        className="cursor-pointer"
                                    >
                                        <Edit2 className="mr-2 h-4 w-4 text-blue-600" />
                                        Edit Member
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => handlers?.onEditRoles?.(member)}
                                        className="cursor-pointer"
                                    >
                                        <Shield className="mr-2 h-4 w-4 text-slate-600" />
                                        Edit Roles
                                    </DropdownMenuItem>

                                    {member.status === "Pending" ? (
                                        <DropdownMenuItem
                                            onClick={() => handlers?.onRevokeInvitation?.(member)}
                                            className="cursor-pointer text-amber-600 focus:text-amber-600"
                                        >
                                            <Ban className="mr-2 h-4 w-4" />
                                            Revoke Invitation
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            onClick={() => handlers?.onToggleStatus?.(member)}
                                            disabled={isSelf}
                                            className="cursor-pointer"
                                        >
                                            {member.status === "Active" ? (
                                                <>
                                                    <UserX className="mr-2 h-4 w-4 text-red-500" />
                                                    Deactivate Member
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                                                    Activate Member
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={() => handlers?.onDelete?.(member)}
                                        disabled={isSelf}
                                        variant="destructive"
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Member
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

export const Column = createColumns();