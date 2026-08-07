import { type AnyFieldApi } from "@tanstack/react-form";
export default function FieldInfo({ field }: { field: AnyFieldApi }) {

    return (
        <div className="min-h-[1rem] flex items-center">
            {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <em className="text-destructive text-xs">{field.state.meta.errors.map((error) => error.message).join(', ')}</em>
            ) : null}
            {field.state.meta.isValidating ? <span className="text-muted-foreground text-xs">Validating...</span> : null}
        </div>
    )
}