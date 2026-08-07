import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
// import { TextField } from "./text-field"; 
// import SubmitButton from "../SubmitButton";
// import { SubmitButton } from "./SubmitButton";
import { SubmitFormButton } from "./SubmitFormButton";

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
    fieldComponents: {
    },
    formComponents: {
        SubmitFormButton
    },
    fieldContext,
    formContext
}
);