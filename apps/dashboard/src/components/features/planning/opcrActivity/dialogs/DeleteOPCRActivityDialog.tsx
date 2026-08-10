import { toast } from "sonner";
import { createMutationHookFromTemplate } from "erpez-shared-lib";
import * as erpSharedLib from "erpez-shared-lib";
import { useAtomValue, useSetAtom } from "jotai";
import { deleteOPCRActivityRequest } from "../handlers/deleteOPCRActivityRequest";
import { closeDeleteDialogAtom, deleteDialogAtom, deletingActivityAtom } from "../atoms/dialogAtoms";
import { ConfirmAlertDialog } from "@/components/ConfirmAlertDialog";

const { useQueryClient } = erpSharedLib;
const useDeleteOPCRActivity = createMutationHookFromTemplate(deleteOPCRActivityRequest);

export default function DeleteOPCRActivityDialog() {
    const { mutateAsync, isPending } = useDeleteOPCRActivity();

    const dialogState = useAtomValue(deleteDialogAtom);
    const closeDialog = useSetAtom(closeDeleteDialogAtom);
    const deletingActivity = useAtomValue(deletingActivityAtom);

    const queryClient = useQueryClient();
    const onDelete = () => {
        if (!deletingActivity) return;

        toast.promise(
            mutateAsync(
                { pathParams: { id: deletingActivity.id } },
                {
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            predicate: (query) =>
                                typeof query.queryKey[0] === 'string' &&
                                query.queryKey[0].startsWith('/opcr-activities'),
                        });
                    },
                },
            ),
            {
                loading: "Deleting OPCR Activity...",
                success: (res) => {
                    closeDialog();
                    return res.message;
                },
                error: "Failed to delete OPCR Activity.",
            },
        );
    };

    const handleCancelDelete = () => {
        void queryClient.cancelQueries({
            queryKey: ["delete-opcr-activity"],
        });
    };

    if (!deletingActivity) return null;

    return (
        <ConfirmAlertDialog
            loading={isPending}
            onConfirm={onDelete}
            onCancel={handleCancelDelete}
            open={dialogState.isOpen}
            onOpenChange={(open) => {
                if (!open) closeDialog();
            }}
            title="Delete OPCR Activity"
            description={`Are you sure you want to delete "${deletingActivity.name}"? This action cannot be undone.`}
        />
    );
}