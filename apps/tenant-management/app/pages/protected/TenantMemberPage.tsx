import { Column, Toolbar, type TenantMember } from '~/components/features/tenant-member';
import { TemplateTable } from '~/components/TemplateTable'

const generateFakeTenantMember = (count: number): TenantMember[] => {
    return Array.from({ length: count }, (_, index) => ({
        id: `tenant-${index}`,
        name: `Tenant ${index}`,
        role: `Role ${index}`,
        status: index % 3 === 0 ? 'Active' : index % 3 === 1 ? 'Pending' : 'Disabled',
    }));
}

function TenantMemberPage() {
    const data = generateFakeTenantMember(25);
    return (
        <TemplateTable
            title='Tenant Member'
            description='Manage Tenant Member'
            actions={[]}
            columns={Column}
            data={data}
            readonly
            toolbar={table => <Toolbar table={table} />}

        />
    )
}

export default TenantMemberPage

