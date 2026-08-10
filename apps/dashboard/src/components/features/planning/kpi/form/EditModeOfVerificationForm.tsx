import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import FileUpload from '../../file-upload/FileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useKpiData } from '@/providers/KpiProvider'

export const editModeOfVerificationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string(),
    file: z.instanceof(File).optional(),
    removeExistingFile: z.boolean().optional()
})

export type EditModeOfVerificationFormValues = z.infer<typeof editModeOfVerificationSchema>
export type EditModeOfVerificationSubmission = { 
    name: string
    description: string
    file?: File
    removeExistingFile?: boolean
}

interface EditModeOfVerificationFormProps {
    movId: string
    onSubmit: (data: EditModeOfVerificationSubmission) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function EditModeOfVerificationForm({
    movId,
    onSubmit,
    onCancel,
    isLoading = false,
}: EditModeOfVerificationFormProps) {
    const kpi = useKpiData()
    const mov = kpi.KPIModeOfVerifications.find(m => m.id === movId)

    const form = useForm({
        defaultValues: {
            name: mov?.name || '',
            description: mov?.description || '',
            removeExistingFile: false,
        } as EditModeOfVerificationFormValues,
        validators: {
            onChange: editModeOfVerificationSchema,
        },
        onSubmit: ({ value }) => {
            onSubmit({
                name: value.name,
                description: value.description,
                file: value.file,
                removeExistingFile: value.removeExistingFile,
            })
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-sm">
                        Name <span className="text-destructive">*</span>
                    </Label>
                    <form.Field
                        name="name"
                        children={(field) => (
                            <Input
                                type="text"
                                value={field.state.value || ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g., Monthly Reports, Audit Trail, Performance Review"
                                disabled={isLoading}
                                className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap"
                            />
                        )}
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-sm">Description</Label>
                    <form.Field
                        name="description"
                        children={(field) => (
                            <Textarea
                                value={field.state.value || ''}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Describe this mode of verification..."
                                disabled={isLoading}
                                rows={3}
                                className="w-full resize-none overflow-hidden"
                            />
                        )}
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-sm">File/Document</Label>
                    <form.Field
                        name="file"
                        children={() => (
                            <FileUpload
                                onFileChange={(file) => {
                                    form.setFieldValue('file', file || undefined)
                                    form.setFieldValue('removeExistingFile', mov?.url && file instanceof File ? true : false)
                                }}
                                disabled={isLoading}
                                acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                maxSize={10}
                                existingFileUrl={mov?.url || undefined}
                                existingFileName={mov?.url ? mov.name + ' file' : undefined}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                />
            </div>
        </form>
    )
}