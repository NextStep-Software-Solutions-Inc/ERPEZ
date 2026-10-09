import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createMutationHookFromTemplate } from "erpez-shared-lib";
import { createTenantRequest } from "../handlers/createTenantRequest";
import { type Tenant } from "../type/Tenant";
import SubmitButton from "~/components/SubmitButton";
import * as erpSharedLib from "erpez-shared-lib";
import invalidateQueries from "~/services/utils/queries";
import { useNavigate } from "react-router";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";
import FieldInfo from "~/components/FieldInfo";
import { cn } from "~/lib/utils";

// Keep the schema input shape identical to the form's defaultValues.
const createTenantSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    billingContactEmail: z.string()
        .email("Please enter a valid email address"),
    description: z.string(),
});
export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;
interface CreateTenantFormProps {
    onCreated?: (tenant: Tenant) => void;
    onClose?: () => void; 
    gradientButton?: boolean;
}

const useCreateTenant = createMutationHookFromTemplate(createTenantRequest);
const { useQueryClient } = erpSharedLib;

export default function CreateTenantForm({ onCreated, onClose, gradientButton }: CreateTenantFormProps) { 
    const form = useForm({
        defaultValues: {
            name: '',
            billingContactEmail: '',
            description: '',
        },
        validationLogic: revalidateLogic(),
        validators: {
            onChange: createTenantSchema
        },
        onSubmit: (values) => {
            toast.promise(
                mutateAsync({
                    pathParams: {},
                    payload: {
                        ...values.value,
                        onPremise: false,
                    }
                }, {
                    onSuccess(data) {
                        invalidateQueries(queryClient, "/tenants");
                        onCreated?.(data.data);
                        onClose?.();
                        navigate('/overview');
                    },
                }), {
                loading: "Creating workspace...",
            },
            );
        }
    });

    const { mutateAsync, isPending } = useCreateTenant();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
    };

    const handleCancel = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        onClose?.();
        form.reset();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm w-full">
            <form.Field
                name="name"
                children={(field) => ( 
                    <div className="min-h-[3rem]">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                            Tenant/Workspace Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id={field.name}
                            className="mt-1 w-full rounded border  placeholder:text-gray-300 border-gray-300 p-2 text-sm font-medium"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            required
                            placeholder="Enter Workspace Name..."
                        />
                        <FieldInfo field={field} />
                    </div>
                )}
            />
            <form.Field name="billingContactEmail" children={(field) => (
                <div className="min-h-[3rem]">
                    <Label htmlFor="billingContactEmail" className="text-sm font-medium">
                        Company Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                    id="billingContactEmail"
                        placeholder="Enter Company Email..."
                        className="mt-1 w-full rounded border placeholder:text-gray-300 border-gray-300 p-2 text-sm font-medium"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    required
                    />            
                    <FieldInfo field={field} />
                </div>
            )} />
            <form.Field name="description" children={(field) => (
                <div className="min-h-[3rem]">
                    <Label htmlFor="description" className="text-sm font-medium">
                        Description
                    </Label>
                    <Input
                        id="description"
                        placeholder="Enter Description (optional)..."
                        className="mt-1 w-full rounded border placeholder:text-gray-300 border-gray-300 p-2 text-sm font-medium"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                    <FieldInfo field={field} />
                </div>
            )} />

            <div className="flex justify-between gap-2 mt-4">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <>
                            <Button
                                variant="outline"
                                type="reset"
                                onClick={handleCancel}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                                Cancel
                            </Button>
                            <SubmitButton loading={isPending || isSubmitting} className={cn("bg-blue-900 text-white hover:bg-blue-800", { "opacity-50": !canSubmit }, `${gradientButton ? "bg-gradient-to-r opacity-70 from-[var(--button-blue)] to-[var(--button-green)] hover:opacity-100" : ""}`)} disabled={!canSubmit} type="submit">
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </SubmitButton>
                        </>
                    )}
                />
            </div>
        </form>
    );
}
