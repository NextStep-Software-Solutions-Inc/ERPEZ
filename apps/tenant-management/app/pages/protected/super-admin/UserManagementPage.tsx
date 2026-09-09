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
} from "~/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    Users,
    UserPlus,
    Shield,
    Key,
    CheckCircle2,
    Search,
    RefreshCw,
    Building2,
    Lock
} from "lucide-react";
import { toast } from "sonner";

interface SystemUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "Super Admin" | "Tenant Admin" | "Auditor" | "Developer" | "Member";
    tenantName?: string;
    keycloakSynced: boolean;
    isActive: boolean;
    createdDate: string;
}

const INITIAL_USERS: SystemUser[] = [
    {
        id: "usr-001",
        username: "superadmin",
        email: "admin@erpez.local",
        firstName: "System",
        lastName: "Administrator",
        role: "Super Admin",
        tenantName: "Global System",
        keycloakSynced: true,
        isActive: true,
        createdDate: "2026-01-10",
    },
    {
        id: "usr-002",
        username: "acme.admin",
        email: "admin@acme-corp.com",
        firstName: "Sarah",
        lastName: "Jenkins",
        role: "Tenant Admin",
        tenantName: "ACME Industrial Corp",
        keycloakSynced: true,
        isActive: true,
        createdDate: "2026-02-14",
    },
    {
        id: "usr-003",
        username: "defense.sec",
        email: "secops@sovereign-gov.mil",
        firstName: "Marcus",
        lastName: "Vance",
        role: "Auditor",
        tenantName: "Sovereign Defense Unit",
        keycloakSynced: true,
        isActive: true,
        createdDate: "2026-03-01",
    },
];

export default function UserManagementPage() {
    const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Form state
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<SystemUser["role"]>("Tenant Admin");
    const [assignedTenant, setAssignedTenant] = useState("ACME Industrial Corp");

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.tenantName && u.tenantName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSyncKeycloak = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success("Keycloak Realm users synchronized successfully.");
        }, 1200);
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !username.trim()) {
            toast.error("Username and email are required.");
            return;
        }

        const newUser: SystemUser = {
            id: `usr-${Date.now().toString().slice(-4)}`,
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            firstName: firstName.trim() || "User",
            lastName: lastName.trim() || "",
            role,
            tenantName: assignedTenant,
            keycloakSynced: true,
            isActive: true,
            createdDate: new Date().toISOString().split("T")[0],
        };

        setUsers([newUser, ...users]);
        setIsAddOpen(false);
        setUsername("");
        setEmail("");
        setFirstName("");
        setLastName("");
        toast.success(`User ${newUser.username} provisioned into Keycloak Realm.`);
    };

    const toggleUserStatus = (id: string) => {
        setUsers((prev) =>
            prev.map((u) => {
                if (u.id === id) {
                    const updated = !u.isActive;
                    toast.info(`User ${u.username} has been ${updated ? "enabled" : "suspended"}.`);
                    return { ...u, isActive: updated };
                }
                return u;
            })
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Management (Keycloak)</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Decoupled centralized user identity & access control. Users exist independently of tenant domains.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncKeycloak}
                        disabled={isSyncing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync Realm
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-blue flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Provision User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleCreateUser}>
                                <DialogHeader>
                                    <DialogTitle>Provision System User into Keycloak</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                required
                                                placeholder="e.g. john.doe"
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
                                                placeholder="john@example.com"
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Assigned Role</Label>
                                            <Select value={role} onValueChange={(val: any) => setRole(val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                                                    <SelectItem value="Tenant Admin">Tenant Admin</SelectItem>
                                                    <SelectItem value="Auditor">Auditor</SelectItem>
                                                    <SelectItem value="Member">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tenant Assignment</Label>
                                            <Select value={assignedTenant} onValueChange={setAssignedTenant}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select tenant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACME Industrial Corp">ACME Industrial Corp</SelectItem>
                                                    <SelectItem value="Sovereign Defense Unit">Sovereign Defense Unit</SelectItem>
                                                    <SelectItem value="Global System">Global System (No Tenant)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/60 text-xs text-blue-800 flex items-start gap-2">
                                        <Key className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                                        <span>
                                            This user will be provisioned directly into the master Keycloak realm with temporary credentials sent to their email.
                                        </span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="btn-blue">
                                        Create Keycloak User
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Realm Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Identity Realm</CardTitle>
                        <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">erpez-realm</div>
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
                            Fail-Closed JWT Validation
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Architecture Policy</CardTitle>
                        <Building2 className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-xl font-bold text-slate-900">Decoupled Users</div>
                        <div className="text-xs text-slate-500 mt-1">
                            No users stored inside tenants
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">System Users ({filteredUsers.length})</CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Keycloak identity identities synchronized with ERP authorization engine
                        </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users, email, tenant..."
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
                                <th className="py-3.5 px-4">User</th>
                                <th className="py-3.5 px-4">Role</th>
                                <th className="py-3.5 px-4">Assigned Tenant</th>
                                <th className="py-3.5 px-4">Keycloak Sync</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                        No system users found matching "{searchQuery}".
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
                                            <Badge variant="outline" className="font-medium text-xs">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="text-xs text-slate-700 font-medium">
                                                {user.tenantName || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {user.keycloakSynced ? (
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleUserStatus(user.id)}
                                                className={`text-xs ${
                                                    user.isActive
                                                        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                {user.isActive ? "Suspend" : "Activate"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
