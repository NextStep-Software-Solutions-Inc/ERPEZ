import React, { useState } from "react";
import { PageContainer } from "~/components/PageContainer";
import { Card } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useClerkAuth } from "~/providers/ClerkAuthProvider";
import { ShieldCheck, Lock } from "lucide-react";

function SettingsPage() {
    const [tab, setTab] = useState<string>("account");
    const { user, isSuperAdmin } = useClerkAuth();

    const fullName = user?.displayName || "Platform Administrator";
    const email = user?.email || "—";
    const username = user?.username || email.split("@")[0] || "admin";
    const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "PA";
    const roles = user?.roles && user.roles.length > 0
        ? user.roles
        : isSuperAdmin
            ? ["SuperAdmin"]
            : ["Platform Operator"];

    return (
        <PageContainer title="Settings" description="View your authenticated platform administrator identity and security configuration">
            <div className="space-y-6">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="pt-4">
                        <Card className="p-6">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <div className="h-10 w-10 flex items-center justify-center rounded bg-slate-900 text-white font-semibold text-xs">
                                            {initials}
                                        </div>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-medium">{fullName}</h3>
                                            <Badge variant="secondary">
                                                {isSuperAdmin ? "Platform Administrator" : "System Operator"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{email}</p>
                                    </div>
                                </div>

                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Managed via Clerk SSO
                                </Badge>
                            </div>

                            <Separator className="my-6" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={fullName} readOnly disabled />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={email} readOnly disabled />
                                </div>

                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input value={username} readOnly disabled />
                                </div>

                                <div className="space-y-2">
                                    <Label>Assigned Platform Roles</Label>
                                    <Input value={roles.join(", ")} readOnly disabled />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="pt-4">
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-semibold">Identity & Authentication Security</h4>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Platform administrator authentication, password policies, and multi-factor authentication (MFA) are centrally managed through Clerk OAuth 2.0 / OIDC single sign-on.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                                <div className="p-3.5 rounded-lg border bg-slate-50">
                                    <span className="text-slate-500 block mb-1">Authentication Provider</span>
                                    <strong className="text-slate-900">Clerk Directory (JWKS / OIDC)</strong>
                                </div>
                                <div className="p-3.5 rounded-lg border bg-slate-50">
                                    <span className="text-slate-500 block mb-1">Authorization Scope</span>
                                    <strong className="text-slate-900">Platform Control Plane (SuperAdmin)</strong>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    );
}

export default SettingsPage; 