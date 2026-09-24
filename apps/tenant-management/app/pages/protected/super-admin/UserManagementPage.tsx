import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "~/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    UserPlus,
    Shield,
    Key,
    CheckCircle2,
    Search,
    RefreshCw,
    Building2,
    Lock,
    ShieldAlert,
    AlertCircle,
    SlidersHorizontal,
    MoreHorizontal,
    ExternalLink,
    UserCheck,
    UserX,
    FolderLock,
    ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

interface WorkspaceAccessItem {
    workspaceName: string;
    workspaceId: string;
    role: string;
    status: "Active" | "Pending" | "Disabled";
}

interface PlatformUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    platformRole: "Platform Administrator" | "Platform Auditor" | "Platform Support";
    workspaceMemberships: WorkspaceAccessItem[];
    clerkSynced: boolean;
    isActive: boolean;
    createdDate: string;
}

const INITIAL_PLATFORM_USERS: PlatformUser[] = [
    {
        id: "usr-001",
        username: "superadmin",
        email: "superadmin@erpez.dev",
        firstName: "Super",
        lastName: "Administrator",
        platformRole: "Platform Administrator",
        workspaceMemberships: [
            {
                workspaceName: "ERPEZ Enterprise Corp",
                workspaceId: "00000000-0000-0000-0000-000000000001",
                role: "Workspace Administrator",
                status: "Active",
            },
            {
                workspaceName: "North Region Subsidiary Inc.",
                workspaceId: "00000000-0000-0000-0000-000000000010",
                role: "Workspace Administrator",
                status: "Active",
            },
        ],
        clerkSynced: true,
        isActive: true,
        createdDate: "2026-01-10",
    },
    {
        id: "usr-002",
        username: "auditor.compliance",
        email: "auditor@erpez.dev",
        firstName: "Jane",
        lastName: "Smith",
        platformRole: "Platform Auditor",
        workspaceMemberships: [],
        clerkSynced: true,
        isActive: true,
        createdDate: "2026-02-14",
    },
    {
        id: "usr-003",
        username: "ops.support",
        email: "support@erpez.dev",
        firstName: "John",
        lastName: "Doe",
        platformRole: "Platform Support",
        workspaceMemberships: [
            {
                workspaceName: "South Distribution Corp.",
                workspaceId: "00000000-0000-0000-0000-000000000030",
                role: "Support / Diagnostics",
                status: "Active",
            },
        ],
        clerkSynced: true,
        isActive: true,
        createdDate: "2026-03-01",
    },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState<PlatformUser[]>(INITIAL_PLATFORM_USERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Edit Role Modal state
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
    const [newPlatformRole, setNewPlatformRole] = useState<PlatformUser["platformRole"]>("Platform Support");

    // Workspace Access Modal state
    const [viewingAccessUser, setViewingAccessUser] = useState<PlatformUser | null>(null);

    // Add User Form state
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [platformRole, setPlatformRole] = useState<PlatformUser["platformRole"]>("Platform Administrator");

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.platformRole.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSyncClerk = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success("Clerk platform directory synchronized successfully.");
        }, 1200);
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !email) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const newUser: PlatformUser = {
            id: `usr-${Date.now().toString().slice(-4)}`,
            username,
            email,
            firstName,
            lastName,
            platformRole,
            workspaceMemberships: [],
            clerkSynced: true,
            isActive: true,
            createdDate: new Date().toISOString().split("T")[0],
        };

        setUsers([newUser, ...users]);
        toast.success(`Platform User ${username} successfully provisioned into Clerk directory with role ${platformRole}.`);
        setIsAddOpen(false);

        // Reset form
        setUsername("");
        setEmail("");
        setFirstName("");
        setLastName("");
        setPlatformRole("Platform Administrator");
    };

    const handleOpenEditRole = (user: PlatformUser) => {
        setEditingUser(user);
        setNewPlatformRole(user.platformRole);
    };

    const handleSaveRole = () => {
        if (!editingUser) return;
        setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? { ...u, platformRole: newPlatformRole } : u))
        );
        toast.success(`Platform role for ${editingUser.username} updated to ${newPlatformRole}.`);
        setEditingUser(null);
    };

    const toggleUserStatus = (id: string) => {
        setUsers((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    const updated = !u.isActive;
                    toast.info(`Platform user ${u.username} has been ${updated ? "enabled" : "suspended"}.`);
                    return { ...u, isActive: updated };
                }
                return u;
            })
        );
    };

    const getRoleBadge = (role: PlatformUser["platformRole"]) => {
        switch (role) {
            case "Platform Administrator":
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200 gap-1 font-semibold text-xs">
                        <ShieldAlert className="w-3 h-3 text-purple-600" />
                        Platform Administrator
                    </Badge>
                );
            case "Platform Auditor":
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1 font-medium text-xs">
                        <Shield className="w-3 h-3 text-amber-600" />
                        Platform Auditor
                    </Badge>
                );
            case "Platform Support":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 gap-1 font-medium text-xs">
                        <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                        Platform Support
                    </Badge>
                );
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Platform Users & Access Control</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage administrators and operators who have access to the ERPEZ platform. Platform access is separate from membership in individual workspaces.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncClerk}
                        disabled={isSyncing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync Clerk Directory
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-blue flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Platform User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleCreateUser}>
                                <DialogHeader>
                                    <DialogTitle>Provision Platform User into Clerk Directory</DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Assign platform control-plane capabilities to an authenticated identity.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                required
                                                placeholder="e.g. ops.admin"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                placeholder="admin@erpez.dev"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="First Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Last Name"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Platform Role (Mutually Exclusive)</Label>
                                        <Select value={platformRole} onValueChange={(val: any) => setPlatformRole(val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select platform role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Platform Administrator">
                                                    Platform Administrator (Full Control Plane Access)
                                                </SelectItem>
                                                <SelectItem value="Platform Auditor">
                                                    Platform Auditor (Read-Only Compliance & Audit)
                                                </SelectItem>
                                                <SelectItem value="Platform Support">
                                                    Platform Support (Tenant Diagnostics & Operational Support)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/60 text-xs text-blue-800 flex items-start gap-2">
                                        <Key className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                                        <span>
                                            This user will be provisioned directly into Clerk with platform-plane permissions. Platform roles grant access to ERPEZ administration and do not grant access to workspace ERP data.
                                        </span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="btn-blue">
                                        Create Platform User
                                    </Button>
                                 </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Platform Access != Workspace Membership Callout Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 space-y-0.5">
                    <span className="font-bold text-sm text-blue-900 block">Platform access &ne; workspace membership</span>
                    <p className="text-blue-800 leading-relaxed">
                        Platform roles control ERPEZ administration (tenants, subscriptions, licenses, and platform settings). Workspace members control access to a specific customer organization's ERP workspace and operational data.
                    </p>
                </div>
            </div>

            {/* Realm Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Identity Provider</CardTitle>
                        <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">Clerk Directory</div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Connected & Authorized
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Protocol</CardTitle>
                        <Lock className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">OAuth 2.0 / OIDC</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Clerk JWKS Validation
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Architecture Policy</CardTitle>
                        <Building2 className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">Decoupled Identities</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Control Plane decoupled from Workspaces
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="border-slate-200 shadow-xs">
                <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">Platform Users ({filteredUsers.length})</CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Centralized platform administrator, auditor, and support directory
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search platform users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <tr>
                                <th className="py-3.5 px-4">Platform User</th>
                                <th className="py-3.5 px-4">Platform Role</th>
                                <th className="py-3.5 px-4">Workspace Memberships</th>
                                <th className="py-3.5 px-4">Clerk Sync</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                        No platform users found matching "{searchQuery}".
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                    {user.firstName[0]}
                                                    {user.lastName[0] || ""}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        {user.email} &bull; @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getRoleBadge(user.platformRole)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {user.workspaceMemberships.length > 0 ? (
                                                 <button
                                                    onClick={() => setViewingAccessUser(user)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                                    title="Click to view workspace memberships"
                                                >
                                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                                    {user.workspaceMemberships.length}{" "}
                                                    {user.workspaceMemberships.length === 1 ? "Workspace" : "Workspaces"}
                                                    <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">
                                                    No workspace memberships
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {user.clerkSynced ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Synced
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-600">Pending Sync</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    user.isActive
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-red-50 text-red-700 border border-red-200"
                                                }`}
                                            >
                                                {user.isActive ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <DropdownMenuLabel className="text-xs text-slate-500">
                                                        Platform Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenEditRole(user)}
                                                        className="cursor-pointer text-xs flex items-center gap-2"
                                                    >
                                                        <FolderLock className="w-3.5 h-3.5 text-blue-600" />
                                                        Edit Platform Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setViewingAccessUser(user)}
                                                        className="cursor-pointer text-xs flex items-center gap-2"
                                                    >
                                                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                                                        View Workspace Access
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            toast.success(`Clerk sync verified for @${user.username}`);
                                                        }}
                                                        className="cursor-pointer text-xs flex items-center gap-2"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                                                        Sync from Clerk
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className={`cursor-pointer text-xs flex items-center gap-2 ${
                                                            user.isActive ? "text-rose-600" : "text-emerald-600"
                                                        }`}
                                                    >
                                                        {user.isActive ? (
                                                            <>
                                                                <UserX className="w-3.5 h-3.5" />
                                                                Suspend User
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="w-3.5 h-3.5" />
                                                                Activate User
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Edit Platform Role Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Platform Access</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Configure control-plane role for{" "}
                            <strong>
                                {editingUser?.firstName} {editingUser?.lastName}
                            </strong>{" "}
                            (@{editingUser?.username})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">Platform Role</Label>
                            <Select
                                value={newPlatformRole}
                                onValueChange={(val: any) => setNewPlatformRole(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select platform role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Platform Administrator">
                                        Platform Administrator (Full Control Plane Access)
                                    </SelectItem>
                                    <SelectItem value="Platform Auditor">
                                        Platform Auditor (Read-Only Compliance & Audit)
                                    </SelectItem>
                                    <SelectItem value="Platform Support">
                                        Platform Support (Tenant Diagnostics & Troubleshooting)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newPlatformRole === "Platform Administrator" && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-semibold block">Privileged Control Plane Operation</strong>
                                    <p className="mt-0.5 text-amber-800">
                                        Assigning Platform Administrator grants full authority to create/disable workspaces, provision databases, and manage other platform administrators.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                            <span className="font-semibold block text-slate-700">Platform Authorization Policy</span>
                            <p className="mt-0.5">
                                Platform roles are mutually exclusive and governed via Clerk directory publicMetadata claims. Workspace memberships remain unchanged.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancel
                        </Button>
                        <Button className="btn-blue" onClick={handleSaveRole}>
                            Save Platform Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Workspace Access Inspection Modal */}
            <Dialog open={!!viewingAccessUser} onOpenChange={(open) => !open && setViewingAccessUser(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Workspace Memberships
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            Workspace memberships for{" "}
                            <strong>
                                {viewingAccessUser?.firstName} {viewingAccessUser?.lastName}
                            </strong>{" "}
                            ({viewingAccessUser?.email})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-xs">
                                <span className="text-slate-500 block">Platform Control Plane Role</span>
                                <div className="mt-1">
                                    {viewingAccessUser && getRoleBadge(viewingAccessUser.platformRole)}
                                </div>
                            </div>
                            <div className="text-right text-xs">
                                <span className="text-slate-500 block">Workspace Count</span>
                                <span className="font-bold text-slate-900 text-sm">
                                    {viewingAccessUser?.workspaceMemberships.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Informational Callout */}
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Platform access &ne; workspace membership:</strong> Workspace membership does not grant platform access, and platform roles do not automatically grant workspace ERP access.
                            </p>
                        </div>

                        {/* Memberships Table */}
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-700 block">
                                Authorized Customer Workspaces
                            </span>
                            {!viewingAccessUser?.workspaceMemberships ||
                            viewingAccessUser.workspaceMemberships.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    No workspace memberships. This identity holds only platform control plane permissions.
                                </div>
                            ) : (
                                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                                    {viewingAccessUser.workspaceMemberships.map((ws, i) => (
                                        <div key={i} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                                            <div>
                                                <span className="font-semibold text-slate-900 block">{ws.workspaceName}</span>
                                                <span className="text-[11px] text-slate-500 font-mono">ID: {ws.workspaceId.slice(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-700 text-[11px]">
                                                    {ws.role}
                                                </Badge>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {ws.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingAccessUser(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
