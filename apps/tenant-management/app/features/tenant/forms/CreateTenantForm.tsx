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
    submitButtonText?: string;
    className?: string;
}

const useCreateTenant = createMutationHookFromTemplate(createTenantRequest);
const { useQueryClient } = erpSharedLib;

export default function CreateTenantForm({
    onCreated,
    onClose,
    gradientButton,
    submitButtonText = "Create Workspace",
    className,
}: CreateTenantFormProps) { 
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
        form.reset();
        if (onClose) {
            onClose();
        } else if (typeof window !== "undefined" && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4 w-full", className || "max-w-sm")}>
            <form.Field
                name="name"
                children={(field) => ( 
                    <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs sm:text-sm font-semibold text-slate-800">
                            Tenant/Workspace Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id={field.name}
                            className="w-full h-10 sm:h-11 rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition"
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
                <div className="space-y-1.5">
                    <Label htmlFor="billingContactEmail" className="text-xs sm:text-sm font-semibold text-slate-800">
                        Company Email <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="billingContactEmail"
                        type="email"
                        placeholder="Enter Company Email..."
                        className="w-full h-10 sm:h-11 rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                    />            
                    <FieldInfo field={field} />
                </div>
            )} />
            <form.Field name="description" children={(field) => (
                <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs sm:text-sm font-semibold text-slate-800">
                        Description <span className="text-xs font-normal text-slate-400">(optional)</span>
                    </Label>
                    <Input
                        id="description"
                        placeholder="Enter Description (optional)..."
                        className="w-full h-10 sm:h-11 rounded-lg border border-slate-300 bg-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                    <FieldInfo field={field} />
                </div>
            )} />

            <div className="flex items-center justify-end gap-3 pt-3">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleCancel}
                                className="h-10 sm:h-11 px-5 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition text-xs sm:text-sm">
                                Cancel
                            </Button>
                            <SubmitButton
                                loading={isPending || isSubmitting}
                                className={cn(
                                    "h-10 sm:h-11 px-6 rounded-lg text-white font-semibold transition-all shadow-sm text-xs sm:text-sm",
                                    gradientButton
                                        ? "bg-gradient-to-r from-[var(--button-blue)] to-[var(--button-green)] hover:opacity-95 shadow-md shadow-emerald-500/10 cursor-pointer"
                                        : "bg-blue-600 hover:bg-blue-700",
                                    { "opacity-50 cursor-not-allowed": !canSubmit }
                                )}
                                disabled={!canSubmit}
                                type="submit">
                                {isPending || isSubmitting ? "Creating workspace..." : (submitButtonText || "Create Workspace")}
                            </SubmitButton>
                        </>
                    )}
                />
            </div>
        </form>
    );
}
