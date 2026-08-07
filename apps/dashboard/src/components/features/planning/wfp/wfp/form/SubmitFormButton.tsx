import { useStore } from "@tanstack/react-form";
import { Loader } from "lucide-react";
import { useFormContext } from ".";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SubmitFormButtonProps {
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const SubmitFormButton = ({ children, disabled, loading, className }: SubmitFormButtonProps) => {
    const form = useFormContext();

    const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
        state.isSubmitting,
        state.canSubmit,
    ]);

    return (
        <Button type="submit" disabled={disabled || !canSubmit || isSubmitting} className={className}>
            <Loader
                className={cn('animate-spin transition-all', {
                    hidden: !loading,
                })}
            />
            {children}
        </Button>
    );
}