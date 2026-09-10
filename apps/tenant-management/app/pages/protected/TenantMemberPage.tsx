import React, { useState } from 'react';
import { createColumns, Toolbar, type TenantMember } from '~/components/features/tenant-member';
import { TemplateTable } from '~/components/TemplateTable';
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib';
import { getTenantMembersRequest } from '~/features/tenant-member/handlers/getTenantMembersRequest';
import { createTenantMemberRequest } from '~/features/tenant-member/handlers/createTenantMemberRequest';
import { getAssignableRolesRequest } from '~/features/tenant-member/handlers/getAssignableRolesRequest';
import { updateTenantMemberRolesRequest } from '~/features/tenant-member/handlers/updateTenantMemberRolesRequest';
import { toggleTenantMemberStatusRequest } from '~/features/tenant-member/handlers/toggleTenantMemberStatusRequest';
import { revokeTenantMemberInvitationRequest } from '~/features/tenant-member/handlers/revokeTenantMemberInvitationRequest';
import { deleteTenantMemberRequest } from '~/features/tenant-member/handlers/deleteTenantMemberRequest';
import { useTenant } from '~/providers/TenantProvider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '~/components/ui/dialog';
import { UserPlus, Loader2, Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const useTenantMembers = createQueryHookFromTemplate(getTenantMembersRequest);
const useAssignableRoles = createQueryHookFromTemplate(getAssignableRolesRequest);
const useCreateMember = createMutationHookFromTemplate(createTenantMemberRequest);
const useUpdateRoles = createMutationHookFromTemplate(updateTenantMemberRolesRequest);
const useToggleStatus = createMutationHookFromTemplate(toggleTenantMemberStatusRequest);
const useRevokeInvitation = createMutationHookFromTemplate(revokeTenantMemberInvitationRequest);
const useDeleteMember = createMutationHookFromTemplate(deleteTenantMemberRequest);

function TenantMemberPage() {
    const { tenant } = useTenant();
    const activeTenantId = tenant?.id || '';

    // Invite Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    // Post-Invite Token Dialog State
    const [invitationResult, setInvitationResult] = useState<{ email: string; token: string; expiresAt: string } | null>(null);
    const [hasCopiedToken, setHasCopiedToken] = useState(false);

    // Edit Roles Modal State
    const [editingMember, setEditingMember] = useState<TenantMember | null>(null);
    const [memberRoleIds, setMemberRoleIds] = useState<string[]>([]);

    const { data: membersResponse, isLoading, refetch } = useTenantMembers({
        pathParams: {},
        queryParams: {
            pageSize: 50,
            pageNumber: 1,
        },
    });

    const { data: assignableRolesResponse } = useAssignableRoles({});

    const assignableRoles = assignableRolesResponse?.data || [];

    const createMemberMutation = useCreateMember();
    const updateRolesMutation = useUpdateRoles();
    const toggleStatusMutation = useToggleStatus();
    const revokeInvitationMutation = useRevokeInvitation();
    const deleteMemberMutation = useDeleteMember();

    const data: TenantMember[] = React.useMemo(() => {
        const rawMembers = membersResponse?.data || [];
        return rawMembers.map((m: any) => ({
            id: m.id,
            name: m.fullName || [m.firstName, m.lastName].filter(Boolean).join(' ') || m.userId || 'Member',
            email: m.email || '',
            role: m.role || (m.roles && m.roles[0]) || 'End User',
            roles: m.roles && m.roles.length > 0 ? m.roles : (m.role ? [m.role] : ['End User']),
            roleIds: m.roleIds || [],
            status: m.status || 'Active',
            concurrencyStamp: m.concurrencyStamp || '',
            invitationExpiresAtUtc: m.invitationExpiresAtUtc,
        }));
    }, [membersResponse]);

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Email is required');
            return;
        }

        try {
            const res = await createMemberMutation.mutateAsync({
                pathParams: {},
                payload: {
                    email: email.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    roleIds: selectedRoleIds.length > 0 ? selectedRoleIds : undefined,
                },
            });

            setIsAddOpen(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setSelectedRoleIds([]);
            await refetch();

            if (res?.data?.invitationToken) {
                setInvitationResult({
                    email: res.data.email,
                    token: res.data.invitationToken,
                    expiresAt: res.data.invitationExpiresAtUtc,
                });
            }
            toast.success('Member invited successfully.');
        } catch {
            // Error handled by interceptor
        }
    };

    const handleOpenEditRoles = (member: TenantMember) => {
        setEditingMember(member);
        setMemberRoleIds(member.roleIds || []);
    };

    const handleSaveRoles = async () => {
        if (!editingMember) return;
        if (memberRoleIds.length === 0) {
            toast.error('At least one role must be selected.');
            return;
        }

        try {
            await updateRolesMutation.mutateAsync({
                pathParams: { id: editingMember.id },
                payload: {
                    roleIds: memberRoleIds,
                    concurrencyStamp: editingMember.concurrencyStamp,
                },
            });
            toast.success('Member roles updated successfully.');
            setEditingMember(null);
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const handleToggleStatus = async (member: TenantMember) => {
        const isDeactivating = member.status === 'Active';
        const newStatus = isDeactivating ? 2 : 1; // 1 = Active, 2 = Disabled (Status enum: Active=1, Disabled=2, Inactive=0, Pending=3, Suspended=4, Cancelled=5)
        try {
            await toggleStatusMutation.mutateAsync({
                pathParams: { id: member.id },
                payload: {
                    status: newStatus,
                    concurrencyStamp: member.concurrencyStamp,
                },
            });
            toast.success(`Member status updated to ${isDeactivating ? 'Disabled' : 'Active'}.`);
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const handleRevokeInvitation = async (member: TenantMember) => {
        try {
            await revokeInvitationMutation.mutateAsync({
                pathParams: { id: member.id },
            });
            toast.success('Invitation revoked successfully.');
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const handleDeleteMember = async (member: TenantMember) => {
        if (!confirm(`Are you sure you want to remove member ${member.name}?`)) {
            return;
        }
        try {
            await deleteMemberMutation.mutateAsync({
                pathParams: { id: member.id },
            });
            toast.success('Member deleted successfully.');
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const columns = React.useMemo(() => {
        return createColumns({
            onEditRoles: handleOpenEditRoles,
            onToggleStatus: handleToggleStatus,
            onRevokeInvitation: handleRevokeInvitation,
            onDelete: handleDeleteMember,
        });
    }, []);

    const copyTokenToClipboard = () => {
        if (!invitationResult?.token) return;
        navigator.clipboard.writeText(invitationResult.token);
        setHasCopiedToken(true);
        toast.success('Invitation token copied to clipboard.');
        setTimeout(() => setHasCopiedToken(false), 2000);
    };

    return (
        <div className="space-y-4">
            <TemplateTable
                title="Tenant Members"
                description="Manage tenant members, assign RBAC roles, and control access permissions."
                actions={[
                    <Dialog key="add-member" open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleInviteMember}>
                                <DialogHeader>
                                    <DialogTitle>Invite Tenant Member</DialogTitle>
                                    <DialogDescription>
                                        Send a secure invitation link to grant tenant access.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="colleague@organization.gov.ph"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
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
                                        <Label>Assignable Roles</Label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                                            {assignableRoles.map((role) => (
                                                <label
                                                    key={role.id}
                                                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded"
                                                >
                                                    <Checkbox
                                                        checked={selectedRoleIds.includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedRoleIds((prev) => [...prev, role.id]);
                                                            } else {
                                                                setSelectedRoleIds((prev) => prev.filter((id) => id !== role.id));
                                                            }
                                                        }}
                                                    />
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.isSystemRole && (
                                                        <Badge variant="outline" className="text-[10px] ml-auto">System</Badge>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            If no roles are selected, the default End User role will be assigned.
                                        </p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMemberMutation.isPending}>
                                        {createMemberMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Send Invitation
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>,
                ]}
                columns={columns}
                data={data}
                readonly
                toolbar={(table) => <Toolbar table={table} />}
            />

            {/* Post-Invite Token Dialog */}
            <Dialog open={!!invitationResult} onOpenChange={(open) => !open && setInvitationResult(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invitation Generated</DialogTitle>
                        <DialogDescription>
                            An invitation has been created for <strong>{invitationResult?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-3">
                        <Label>Single-Use Invitation Token</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={invitationResult?.token || ''}
                                className="font-mono text-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={copyTokenToClipboard}
                            >
                                {hasCopiedToken ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This cryptographic token is valid for 48 hours and can only be used once to bind an authenticated account.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setInvitationResult(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Roles Dialog */}
            <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Edit Member Roles
                        </DialogTitle>
                        <DialogDescription>
                            Modify RBAC role assignments for <strong>{editingMember?.name}</strong> ({editingMember?.email}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-3">
                        <Label>Assigned Roles</Label>
                        <div className="max-h-56 overflow-y-auto space-y-2 border rounded-md p-3">
                            {assignableRoles.map((role) => (
                                <label
                                    key={role.id}
                                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded"
                                >
                                    <Checkbox
                                        checked={memberRoleIds.includes(role.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setMemberRoleIds((prev) => [...prev, role.id]);
                                            } else {
                                                setMemberRoleIds((prev) => prev.filter((id) => id !== role.id));
                                            }
                                        }}
                                    />
                                    <span className="font-medium">{role.name}</span>
                                    {role.isSystemRole && (
                                        <Badge variant="outline" className="text-[10px] ml-auto">System</Badge>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingMember(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRoles}
                            disabled={updateRolesMutation.isPending}
                        >
                            {updateRolesMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TenantMemberPage;
