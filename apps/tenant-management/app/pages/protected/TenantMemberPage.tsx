import React, { useState } from 'react';
import { Column, Toolbar, type TenantMember } from '~/components/features/tenant-member';
import { TemplateTable } from '~/components/TemplateTable';
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib';
import { getTenantMembersRequest } from '~/features/tenant-member/handlers/getTenantMembersRequest';
import { createTenantMemberRequest } from '~/features/tenant-member/handlers/createTenantMemberRequest';
import { useTenant } from '~/providers/TenantProvider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '~/components/ui/dialog';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const useTenantMembers = createQueryHookFromTemplate(getTenantMembersRequest);
const useCreateMember = createMutationHookFromTemplate(createTenantMemberRequest);

function TenantMemberPage() {
    const { tenant } = useTenant();
    const activeTenantId = tenant?.id || '';

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const { data: membersResponse, isLoading, refetch } = useTenantMembers({
        pathParams: {},
        queryParams: {
            tenantId: activeTenantId,
            pageSize: 50,
            pageNumber: 1,
        },
    });

    const createMemberMutation = useCreateMember();

    const data: TenantMember[] = React.useMemo(() => {
        const rawMembers = membersResponse?.data || [];
        return rawMembers.map((m) => ({
            id: m.id,
            name: m.fullName || [m.firstName, m.lastName].filter(Boolean).join(' ') || m.userId || 'Member',
            email: m.email || '',
            role: m.role || (m.roles && m.roles[0]) || 'End User',
            status: m.status || 'Active',
        }));
    }, [membersResponse]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !activeTenantId) {
            toast.error('Email is required');
            return;
        }

        try {
            await createMemberMutation.mutateAsync({
                pathParams: {},
                payload: {
                    tenantId: activeTenantId,
                    userId: email.split('@')[0],
                    email: email.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    status: 1, // Active
                },
            });
            setIsAddOpen(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            await refetch();
        } catch {
            // Error handled by interceptor toast
        }
    };

    return (
        <div className="space-y-4">
            <TemplateTable
                title="Tenant Member"
                description="Manage organizational members and their access."
                actions={[
                    <Dialog key="add-member" open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <form onSubmit={handleAddMember}>
                                <DialogHeader>
                                    <DialogTitle>Add Tenant Member</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="user@example.com"
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
                                        Save Member
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>,
                ]}
                columns={Column}
                data={data}
                readonly
                toolbar={(table) => <Toolbar table={table} />}
            />
        </div>
    );
}

export default TenantMemberPage;

