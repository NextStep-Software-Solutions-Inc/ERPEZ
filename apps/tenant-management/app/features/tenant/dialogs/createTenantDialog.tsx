import { ResponsiveDialog } from "~/components/ResponsiveDialog";
import { type Tenant } from "../type/Tenant";
import CreateTenantForm from "../forms/CreateTenantForm";
import { useState } from "react";

export default function CreateTenantDialog() {

    const [open, setOpen] = useState(true);
    const handleTenantCreated = (tenant: Tenant) => {
        setOpen(false);
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={setOpen}
            title="Create Tenant"
            description="">
            <CreateTenantForm onCreated={handleTenantCreated} onClose={() => setOpen(false)} />
        </ResponsiveDialog>
    );
}
