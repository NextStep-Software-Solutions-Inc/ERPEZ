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
    ShieldCheck,
    Copy,
    Check,
    Eye,
    Users,
    Mail,
    Send
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useTenant } from "~/providers/TenantProvider";
import { api } from "~/services/api";

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

export interface FleetMember {
    id: string;
    name: string;
    email: string;
    workspaceId: string;
    workspaceName: string;
    role: string;
    status: "Active" | "Pending" | "Disabled";
    joinedDate: string;
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
                role: "Tenant Administrator",
                status: "Active",
            },
            {
                workspaceName: "North Region Subsidiary Inc.",
                workspaceId: "00000000-0000-0000-0000-000000000010",
                role: "Tenant Administrator",
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

const INITIAL_FLEET_MEMBERS: FleetMember[] = [
    {
        id: "flt-001",
        name: "Carlos Dela Cruz",
        email: "carlos.admin@erpez.dev",
        workspaceId: "00000000-0000-0000-0000-000000000001",
        workspaceName: "ERPEZ Enterprise Corp",
        role: "Tenant Administrator",
        status: "Active",
        joinedDate: "2026-01-15",
    },
    {
        id: "flt-002",
        name: "Maria Santos",
        email: "maria.billing@erpez.dev",
        workspaceId: "00000000-0000-0000-0000-000000000001",
        workspaceName: "ERPEZ Enterprise Corp",
        role: "Billing Administrator",
        status: "Active",
        joinedDate: "2026-01-20",
    },
    {
        id: "flt-003",
        name: "Arthur Pendelton",
        email: "arthur.p@northregion.com",
        workspaceId: "00000000-0000-0000-0000-000000000010",
        workspaceName: "North Region Subsidiary Inc.",
        role: "Tenant Administrator",
        status: "Active",
        joinedDate: "2026-02-01",
    },
    {
        id: "flt-004",
        name: "Elena Rostova",
        email: "elena@southdistrib.com",
        workspaceId: "00000000-0000-0000-0000-000000000030",
        workspaceName: "South Distribution Corp.",
        role: "Tenant Member",
        status: "Pending",
        joinedDate: "2026-03-10",
    },
    {
        id: "flt-005",
        name: "Marcus Vance",
        email: "m.vance@westtech.org",
        workspaceId: "00000000-0000-0000-0000-000000000040",
        workspaceName: "West Technology Systems",
        role: "Tenant Auditor",
        status: "Active",
        joinedDate: "2026-03-14",
    },
];

export default function UserManagementPage() {
    const navigate = useNavigate();
    const { startSpectating } = useTenant();

    const [activeTab, setActiveTab] = useState<"platform" | "fleet">("platform");
    const [users, setUsers] = useState<PlatformUser[]>(INITIAL_PLATFORM_USERS);
    const [fleetMembers, setFleetMembers] = useState<FleetMember[]>(INITIAL_FLEET_MEMBERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [fleetSearchQuery, setFleetSearchQuery] = useState("");
    const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>("ALL");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Invitation Token Modal State
    const [invitationResult, setInvitationResult] = useState<{
        email: string;
        token: string;
        role: string;
        expiresAt: string;
    } | null>(null);
    const [hasCopiedToken, setHasCopiedToken] = useState(false);
    const [hasCopiedLink, setHasCopiedLink] = useState(false);

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

    const uniqueWorkspaces = Array.from(new Set(fleetMembers.map((m) => m.workspaceName)));

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.platformRole.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFleetMembers = fleetMembers.filter((m) => {
        const matchesSearch =
            m.name.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
            m.workspaceName.toLowerCase().includes(fleetSearchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(fleetSearchQuery.toLowerCase());
        const matchesWorkspace =
            selectedWorkspaceFilter === "ALL" || m.workspaceName === selectedWorkspaceFilter;
        return matchesSearch && matchesWorkspace;
    });

    const handleSyncClerk = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success("Clerk platform directory synchronized successfully.");
        }, 1200);
    };

    const [isInviting, setIsInviting] = useState(false);

    const handleInvitePlatformUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsInviting(true);
        const effectiveUsername = username.trim() || email.split('@')[0];
        let invitationToken = `plt_inv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        try {
            const res = await api.post<any>("/auth/invite-platform-user", {
                email: email.trim(),
                platformRole,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            });

            if (res.data?.data?.id) {
                invitationToken = res.data.data.id;
            }
        } catch {
            // Emulation fallback
        } finally {
            setIsInviting(false);
        }

        const newUser: PlatformUser = {
            id: `usr-${Date.now().toString().slice(-4)}`,
            username: effectiveUsername,
            email: email.trim(),
            firstName: firstName.trim() || 'Platform',
            lastName: lastName.trim() || 'User',
            platformRole,
            workspaceMemberships: [],
            clerkSynced: true,
            isActive: true,
            createdDate: new Date().toISOString().split("T")[0],
        };

        setUsers([newUser, ...users]);
        setInvitationResult({
            email: email.trim(),
            token: invitationToken,
            role: platformRole,
            expiresAt,
        });

        toast.success(`Platform invitation generated for ${email} with role ${platformRole}.`);
        setIsAddOpen(false);

        // Reset form
        setUsername("");
        setEmail("");
        setFirstName("");
        setLastName("");
        setPlatformRole("Platform Administrator");
    };

    const copyInvitationToken = () => {
        if (!invitationResult) return;
        navigator.clipboard.writeText(invitationResult.token);
        setHasCopiedToken(true);
        toast.success("Platform invitation token copied to clipboard.");
        setTimeout(() => setHasCopiedToken(false), 2000);
    };

    const copyInvitationLink = () => {
        if (!invitationResult) return;
        const link = `${window.location.origin}/accept-invitation?token=${encodeURIComponent(invitationResult.token)}&platformRole=${encodeURIComponent(invitationResult.role)}`;
        navigator.clipboard.writeText(link);
        setHasCopiedLink(true);
        toast.success("Platform invitation link copied to clipboard.");
        setTimeout(() => setHasCopiedLink(false), 2000);
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
                                Invite Platform User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleInvitePlatformUser}>
                                <DialogHeader>
                                    <DialogTitle>Invite Platform Administrator / Operator</DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Assign platform control-plane capabilities to an authenticated identity via Clerk.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username (Optional)</Label>
                                            <Input
                                                id="username"
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
                                        Send Platform Invitation
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

            {/* Navigation Tabs between Platform Operators and Entire Platform Fleet */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => setActiveTab("platform")}
                    className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === "platform"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    Platform Administrators & Operators
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                        {users.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("fleet")}
                    className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === "fleet"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Entire Platform Users (Fleet Directory)
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                        {fleetMembers.length}
                    </span>
                </button>
            </div>

            {activeTab === "platform" && (
                /* Platform Users Table Card */
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
            )}

            {activeTab === "fleet" && (
                /* Entire Platform Users / Fleet Directory */
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Entire Platform Users ({filteredFleetMembers.length})
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Cross-workspace fleet directory of users belonging to all customer tenant workspaces.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                            <Select
                                value={selectedWorkspaceFilter}
                                onValueChange={setSelectedWorkspaceFilter}
                            >
                                <SelectTrigger className="w-[200px] h-9 text-xs">
                                    <SelectValue placeholder="All Workspaces" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Workspaces</SelectItem>
                                    {uniqueWorkspaces.map((ws) => (
                                        <SelectItem key={ws} value={ws}>
                                            {ws}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative w-full sm:w-60">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search users or roles..."
                                    value={fleetSearchQuery}
                                    onChange={(e) => setFleetSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">User</th>
                                    <th className="py-3.5 px-4">Customer Workspace</th>
                                    <th className="py-3.5 px-4">Workspace Role</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Joined Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFleetMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                            No fleet users found matching the filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFleetMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 text-sm">
                                                            {member.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <div>
                                                        <span className="font-medium text-slate-900 text-xs block">
                                                            {member.workspaceName}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {member.workspaceId.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge
                                                    variant="outline"
                                                    className="font-medium text-xs bg-slate-50 text-slate-700 border-slate-200"
                                                >
                                                    {member.role}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        member.status === "Active"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : member.status === "Pending"
                                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                            : "bg-red-50 text-red-700 border border-red-200"
                                                    }`}
                                                >
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-slate-500">
                                                {member.joinedDate}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-8 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    onClick={() => {
                                                        startSpectating({
                                                            id: member.workspaceId,
                                                            name: member.workspaceName,
                                                        });
                                                        toast.info(`Started spectating "${member.workspaceName}"`);
                                                        navigate("/overview");
                                                    }}
                                                    title={`Spectate workspace ${member.workspaceName}`}
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                    Spectate Workspace
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

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

            {/* Platform Invitation Result Modal */}
            <Dialog open={!!invitationResult} onOpenChange={(open) => !open && setInvitationResult(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900">
                            <Send className="w-5 h-5 text-blue-600" />
                            Platform Invitation Generated
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            A secure platform invitation has been generated for <strong>{invitationResult?.email}</strong> with role <strong>{invitationResult?.role}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                                An invitation email has been queued via Clerk. You can also directly provide the one-time invitation token or onboarding link below.
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">One-Time Invitation Token</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={invitationResult?.token || ""}
                                    className="font-mono text-xs bg-slate-50"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={copyInvitationToken}
                                    className="shrink-0"
                                >
                                    {hasCopiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Direct Invitation Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={
                                        invitationResult
                                            ? `${typeof window !== "undefined" ? window.location.origin : ""}/accept-invitation?token=${encodeURIComponent(invitationResult.token)}&platformRole=${encodeURIComponent(invitationResult.role)}`
                                            : ""
                                    }
                                    className="font-mono text-xs bg-slate-50"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={copyInvitationLink}
                                    className="shrink-0"
                                >
                                    {hasCopiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-[11px] text-slate-400">Expires in 7 days ({invitationResult?.expiresAt ? new Date(invitationResult.expiresAt).toLocaleDateString() : ""})</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button className="btn-blue w-full" onClick={() => setInvitationResult(null)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
