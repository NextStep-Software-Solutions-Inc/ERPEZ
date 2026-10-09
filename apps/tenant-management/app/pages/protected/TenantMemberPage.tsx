import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    createColumns,
    Toolbar,
    MemberDetailModal,
    EditMemberModal,
    DeleteMemberConfirmModal,
    type TenantMember,
} from '~/components/features/tenant-member';
import { TemplateTable } from '~/components/TemplateTable';
import { PageContainer } from '~/components/PageContainer';
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib';
import { getTenantMembersRequest } from '~/features/tenant-member/handlers/getTenantMembersRequest';
import { createTenantMemberRequest } from '~/features/tenant-member/handlers/createTenantMemberRequest';
import { getAssignableRolesRequest } from '~/features/tenant-member/handlers/getAssignableRolesRequest';
import { updateTenantMemberRolesRequest } from '~/features/tenant-member/handlers/updateTenantMemberRolesRequest';
import { toggleTenantMemberStatusRequest } from '~/features/tenant-member/handlers/toggleTenantMemberStatusRequest';
import { revokeTenantMemberInvitationRequest } from '~/features/tenant-member/handlers/revokeTenantMemberInvitationRequest';
import { resendTenantMemberInvitationRequest } from '~/features/tenant-member/handlers/resendTenantMemberInvitationRequest';
import { deleteTenantMemberRequest } from '~/features/tenant-member/handlers/deleteTenantMemberRequest';
import { useTenant } from '~/providers/TenantProvider';
import { useClerkAuth } from '~/providers/ClerkAuthProvider';
import { usePermissions } from '~/hooks/usePermissions';
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
    DialogFooter,
    DialogDescription,
} from '~/components/ui/dialog';
import { UserPlus, Loader2, Copy, Check, Users, ArrowUpRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const useTenantMembers = createQueryHookFromTemplate(getTenantMembersRequest);
const useAssignableRoles = createQueryHookFromTemplate(getAssignableRolesRequest);
const useCreateMember = createMutationHookFromTemplate(createTenantMemberRequest);
const useUpdateRoles = createMutationHookFromTemplate(updateTenantMemberRolesRequest);
const useToggleStatus = createMutationHookFromTemplate(toggleTenantMemberStatusRequest);
const useRevokeInvitation = createMutationHookFromTemplate(revokeTenantMemberInvitationRequest);
const useResendInvitation = createMutationHookFromTemplate(resendTenantMemberInvitationRequest);
const useDeleteMember = createMutationHookFromTemplate(deleteTenantMemberRequest);

function TenantMemberPage() {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const { user } = useClerkAuth();
    const { hasPermission } = usePermissions();
    const canManageMembers = hasPermission('tenant.members.manage');

    // Invite Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    // Post-Invite Token Dialog State
    const [invitationResult, setInvitationResult] = useState<{ email: string; token: string; expiresAt?: string } | null>(null);
    const [hasCopiedToken, setHasCopiedToken] = useState(false);

    // Detail Modal State
    const [detailMember, setDetailMember] = useState<TenantMember | null>(null);

    // Edit Member Modal State
    const [editingMember, setEditingMember] = useState<TenantMember | null>(null);

    // Delete Confirmation Modal State
    const [deletingMember, setDeletingMember] = useState<TenantMember | null>(null);

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
    const resendInvitationMutation = useResendInvitation();
    const deleteMemberMutation = useDeleteMember();

    const data: TenantMember[] = React.useMemo(() => {
        const rawMembers = membersResponse?.data || [];
        return rawMembers.map((m: any) => ({
            id: m.id,
            name: m.fullName || [m.firstName, m.lastName].filter(Boolean).join(' ') || m.userId || 'Member',
            firstName: m.firstName || '',
            lastName: m.lastName || '',
            email: m.email || '',
            userId: m.userId,
            externalIdentityId: m.externalIdentityId,
            role: m.role || (m.roles && m.roles[0]) || 'Tenant Member',
            roles: m.roles && m.roles.length > 0 ? m.roles : (m.role ? [m.role] : ['Tenant Member']),
            roleIds: m.roleIds || [],
            status: m.status || 'Active',
            concurrencyStamp: m.concurrencyStamp || '',
            invitationExpiresAtUtc: m.invitationExpiresAtUtc,
        }));
    }, [membersResponse]);

    // Governance Admins vs Operational Users separation
    const [viewMode, setViewMode] = useState<'admins' | 'all'>('admins');

    const isGovernanceAdmin = (m: TenantMember) => {
        const adminRoleKeywords = ['administrator', 'auditor', 'billing', 'admin'];
        const roles = (m.roles || [m.role]).map((r) => (r || '').toLowerCase());
        return roles.some((r) => adminRoleKeywords.some((kw) => r.includes(kw)));
    };

    const adminMembers = React.useMemo(() => data.filter(isGovernanceAdmin), [data]);
    const operationalCount = data.length - adminMembers.length;

    const displayMembers = React.useMemo(() => {
        return viewMode === 'admins' ? adminMembers : data;
    }, [viewMode, adminMembers, data]);

    const governanceAssignableRoles = React.useMemo(() => {
        return assignableRoles.filter((r: any) => {
            const lower = (r.name || '').toLowerCase();
            return !lower.includes('planning') && !lower.includes('procurement') && !lower.includes('viewer');
        });
    }, [assignableRoles]);

    // Seat capacity calculations based on active subscription
    // Starter: 10 seats, Professional: 50 seats, Enterprise: Unlimited
    const activePlan = (tenant?.tenantSubscription?.plan || 'Starter').toLowerCase();
    const isStarter = activePlan.includes('starter');
    const isProfessional = activePlan.includes('prof') || activePlan.includes('pro');
    const planDisplayName = isStarter ? 'Starter' : isProfessional ? 'Professional' : 'Enterprise';
    const seatCapacity = isStarter ? 10 : isProfessional ? 50 : Infinity;

    // Seats used count (all active/pending tenant members)
    const seatsUsed = data.filter((m) => m.status !== 'Cancelled').length;
    const isAtCapacity = seatCapacity !== Infinity && seatsUsed >= seatCapacity;
    const isNearCapacity = seatCapacity !== Infinity && seatsUsed >= seatCapacity * 0.8;
    const capacityPercentage = seatCapacity !== Infinity ? Math.min(100, Math.round((seatsUsed / seatCapacity) * 100)) : 0;

    const handleOpenInvite = () => {
        if (isAtCapacity) {
            toast.error(`Seat limit reached for ${planDisplayName} plan (${seatsUsed}/${seatCapacity}). Upgrade your plan to invite more members.`);
            return;
        }
        setIsAddOpen(true);
    };

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
            // Handled by interceptor
        }
    };

    const handleSaveMember = async (
        memberId: string,
        payload: {
            firstName?: string;
            lastName?: string;
            roleIds: string[];
            concurrencyStamp: string;
        }
    ) => {
        try {
            await updateRolesMutation.mutateAsync({
                pathParams: { id: memberId },
                payload,
            });
            toast.success('Member profile and roles updated successfully.');
            setEditingMember(null);
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const handleToggleStatus = async (member: TenantMember) => {
        const isDeactivating = member.status === 'Active';
        const newStatus = isDeactivating ? 2 : 1; // 1 = Active, 2 = Disabled
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

    const handleResendInvitation = async (member: TenantMember) => {
        try {
            const res = await resendInvitationMutation.mutateAsync({
                pathParams: { id: member.id },
            });
            toast.success(`Invitation resent to ${member.email}`);
            if (res?.data?.invitationToken) {
                setInvitationResult({
                    email: res.data.email,
                    token: res.data.invitationToken,
                    expiresAt: res.data.invitationExpiresAtUtc,
                });
            }
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const handleConfirmDelete = async (memberId: string) => {
        try {
            await deleteMemberMutation.mutateAsync({
                pathParams: { id: memberId },
            });
            toast.success('Member removed successfully.');
            setDeletingMember(null);
            await refetch();
        } catch {
            // Handled by interceptor
        }
    };

    const isSelfMember = (member: TenantMember | null): boolean => {
        if (!member) return false;
        if (user?.id && (member.id === user.id || member.userId === user.id || member.externalIdentityId === user.id)) {
            return true;
        }
        if (user?.email && member.email?.toLowerCase() === user.email.toLowerCase()) {
            return true;
        }
        return false;
    };

    const columns = React.useMemo(() => {
        return createColumns({
            onViewDetails: (member) => setDetailMember(member),
            onEditMember: (member) => setEditingMember(member),
            onEditRoles: (member) => setEditingMember(member),
            onToggleStatus: handleToggleStatus,
            onRevokeInvitation: handleRevokeInvitation,
            onResendInvitation: handleResendInvitation,
            onDelete: (member) => setDeletingMember(member),
            currentUserId: user?.id,
            currentUserEmail: user?.email,
            canManage: canManageMembers,
        });
    }, [user?.id, user?.email, canManageMembers]);

    const [hasCopiedLink, setHasCopiedLink] = useState(false);

    const copyTokenToClipboard = () => {
        if (!invitationResult?.token) return;
        navigator.clipboard.writeText(invitationResult.token);
        setHasCopiedToken(true);
        toast.success('Invitation token copied to clipboard.');
        setTimeout(() => setHasCopiedToken(false), 2000);
    };

    const copyLinkToClipboard = () => {
        if (!invitationResult?.token) return;
        const link = `${window.location.origin}/accept-invitation?token=${encodeURIComponent(invitationResult.token)}`;
        navigator.clipboard.writeText(link);
        setHasCopiedLink(true);
        toast.success('Invitation link copied to clipboard.');
        setTimeout(() => setHasCopiedLink(false), 2000);
    };

    return (
        <PageContainer
            title="Members"
            description={`Manage members of ${tenant?.name || 'this workspace'} and assign workspace roles.`}
            actions={
                canManageMembers ? (
                    <Button
                        onClick={handleOpenInvite}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                        <UserPlus className="h-4 w-4" />
                        Invite Member
                    </Button>
                ) : null
            }
        >
            <div className="space-y-6">
                {/* Plan Seat Usage Indicator Banner */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-slate-900">Seat Allocation</span>
                            <Badge variant="secondary" className="text-xs font-medium">
                                {planDisplayName} Plan
                            </Badge>
                            {isAtCapacity && (
                                <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Seat Limit Reached
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {seatCapacity === Infinity ? (
                                <>
                                    Your <strong>{planDisplayName}</strong> subscription includes{' '}
                                    <span className="font-semibold text-slate-900">unlimited member seats</span>.
                                </>
                            ) : (
                                <>
                                    You have allocated <strong className="text-slate-900">{seatsUsed}</strong> of{' '}
                                    <strong className="text-slate-900">{seatCapacity}</strong> seats available on your{' '}
                                    {planDisplayName} plan.
                                </>
                            )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                {adminMembers.length} Tenant {adminMembers.length === 1 ? 'Administrator' : 'Administrators'}
                            </span>
                            {operationalCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                                    <Users className="w-3 h-3 text-slate-600" />
                                    {operationalCount} Operational Workspace {operationalCount === 1 ? 'User' : 'Users'} (managed in ERPEZ)
                                </span>
                            )}
                        </div>
                    </div>

                    {seatCapacity !== Infinity ? (
                        <div className="flex items-center gap-4 min-w-[260px]">
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                                    <span>{capacityPercentage}% utilized</span>
                                    <span>
                                        {seatCapacity - seatsUsed > 0
                                            ? `${seatCapacity - seatsUsed} remaining`
                                            : '0 seats left'}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${
                                            isAtCapacity
                                                ? 'bg-rose-500'
                                                : isNearCapacity
                                                ? 'bg-amber-500'
                                                : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${capacityPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs shrink-0 flex items-center gap-1 hover:bg-slate-50"
                                onClick={() => navigate('/plan')}
                            >
                                <span>Upgrade</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 text-xs py-1 px-2.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                Enterprise Scale
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Sub-view Filter: Admins vs All */}
                <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 text-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('admins')}
                            className={`px-3 py-1 rounded-md transition-all ${
                                viewMode === 'admins'
                                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 font-medium'
                            }`}
                        >
                            Tenant Administrators ({adminMembers.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('all')}
                            className={`px-3 py-1 rounded-md transition-all ${
                                viewMode === 'all'
                                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                                    : 'text-slate-600 hover:text-slate-900 font-medium'
                            }`}
                        >
                            All Workspace Users ({data.length})
                        </button>
                    </div>

                    {operationalCount > 0 && viewMode === 'admins' && (
                        <p className="text-xs text-muted-foreground hidden sm:block">
                            Showing administrative users. {operationalCount} operational {operationalCount === 1 ? 'member' : 'members'} managed in ERPEZ Dashboard.
                        </p>
                    )}
                </div>

                {/* Table Component */}
                <TemplateTable
                    columns={columns}
                    data={displayMembers}
                    readonly
                    toolbar={(table) => <Toolbar table={table} />}
                />
            </div>

            {/* Invite Member Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleInviteMember}>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Invite Tenant Administrator</DialogTitle>
                            <DialogDescription className="text-xs">
                                Send a secure invitation link to grant tenant account administration access.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Control Plane Separation Notice */}
                        <div className="p-3 my-2 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 space-y-1">
                            <p className="font-semibold flex items-center gap-1.5 text-blue-950">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                Governance Role Scope
                            </p>
                            <p className="text-[11px] leading-relaxed text-blue-800">
                                This invitation grants administrative privileges for this Tenant Management Portal (billing, licenses, settings).
                                To invite operational staff and assign operational roles (such as Planning Officer, Procurement Officer, or Employee / Viewer), manage users directly within the <strong>ERPEZ Workspace Dashboard</strong> under <em>Organization &gt; Operational Roles</em>.
                            </p>
                        </div>

                        <div className="space-y-4 py-2 text-xs">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs text-slate-700">
                                    Email Address *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="administrator@organization.gov.ph"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName" className="text-xs text-slate-700">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName" className="text-xs text-slate-700">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-700">Assignable Governance Roles</Label>
                                <div className="max-h-48 overflow-y-auto space-y-1.5 border rounded-lg p-2.5 bg-slate-50/50">
                                    {governanceAssignableRoles.map((role) => (
                                        <label
                                            key={role.id}
                                            className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-white p-1.5 rounded transition"
                                        >
                                            <Checkbox
                                                checked={selectedRoleIds.includes(role.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedRoleIds((prev) => [...prev, role.id]);
                                                    } else {
                                                        setSelectedRoleIds((prev) =>
                                                            prev.filter((id) => id !== role.id)
                                                        );
                                                    }
                                                }}
                                            />
                                            <span className="font-medium text-slate-800">{role.name}</span>
                                            {role.isSystemRole && (
                                                <Badge variant="outline" className="text-[10px] ml-auto py-0">
                                                    System
                                                </Badge>
                                            )}
                                        </label>
                                    ))}
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    If no roles are selected, the default Tenant Member role will be assigned.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddOpen(false)}
                                className="text-xs h-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={createMemberMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                            >
                                {createMemberMutation.isPending && (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                )}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Post-Invite Token Dialog */}
            <Dialog open={!!invitationResult} onOpenChange={(open) => !open && setInvitationResult(null)}>
                <DialogContent className="sm:max-w-md p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold">Invitation Generated</DialogTitle>
                        <DialogDescription className="text-xs">
                            An invitation has been generated for <strong>{invitationResult?.email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-3 text-xs">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-700 font-semibold">Invitation Link</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={invitationResult?.token ? `${window.location.origin}/accept-invitation?token=${encodeURIComponent(invitationResult.token)}` : ''}
                                    className="font-mono text-xs bg-slate-50"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 cursor-pointer"
                                    onClick={copyLinkToClipboard}
                                    title="Copy link"
                                >
                                    {hasCopiedLink ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-700 font-semibold">Single-Use Invitation Token</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={invitationResult?.token || ''}
                                    className="font-mono text-xs bg-slate-50"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 cursor-pointer"
                                    onClick={copyTokenToClipboard}
                                    title="Copy token"
                                >
                                    {hasCopiedToken ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            This cryptographic invitation is valid for 48 hours and can only be used once by the invited email address.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button size="sm" onClick={() => setInvitationResult(null)} className="text-xs h-8">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Member Detail Modal */}
            <MemberDetailModal
                isOpen={!!detailMember}
                member={detailMember}
                onClose={() => setDetailMember(null)}
                onEdit={(m) => {
                    setDetailMember(null);
                    setEditingMember(m);
                }}
                onToggleStatus={handleToggleStatus}
                onResendInvitation={handleResendInvitation}
                onDelete={(m) => {
                    setDetailMember(null);
                    setDeletingMember(m);
                }}
                isSelf={isSelfMember(detailMember)}
            />

            {/* Edit Member Profile & Roles Modal */}
            <EditMemberModal
                isOpen={!!editingMember}
                member={editingMember}
                assignableRoles={assignableRoles}
                onClose={() => setEditingMember(null)}
                onSave={handleSaveMember}
                isSaving={updateRolesMutation.isPending}
            />

            {/* Delete Confirmation Modal */}
            <DeleteMemberConfirmModal
                isOpen={!!deletingMember}
                member={deletingMember}
                onClose={() => setDeletingMember(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMemberMutation.isPending}
                isSelf={isSelfMember(deletingMember)}
            />
        </PageContainer>
    );
}

export default TenantMemberPage;
