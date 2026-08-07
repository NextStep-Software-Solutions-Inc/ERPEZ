import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import FileUpload from '../../file-upload/FileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export const addModeOfVerificationSchema = z.object({
    KPIMOVs: z.array(z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string(),
        fileId: z.string().optional(),
        file: z.instanceof(File).optional()
    })).min(1, 'At least one mode of verification is required')
})

export type AddModeOfVerificationFormValues = z.infer<typeof addModeOfVerificationSchema>
export type AddModeOfVerificationSubmission = {
    KPIMOVs: AddModeOfVerificationFormValues['KPIMOVs']
}

interface AddModeOfVerificationFormProps {
    onSubmit: (data: AddModeOfVerificationSubmission) => void
    onCancel: () => void
    isLoading?: boolean
}

export default function AddModeOfVerificationForm({
    onSubmit,
    onCancel,
    isLoading = false,
}: AddModeOfVerificationFormProps) {
    const form = useForm({
        defaultValues: {
            KPIMOVs: [{
                name: '',
                description: '',
                fileId: '', 
            }],
        } as AddModeOfVerificationFormValues,
        validators: {
            onChange: addModeOfVerificationSchema,
        },
        onSubmit: ({ value }) => {
            onSubmit({
                KPIMOVs: value.KPIMOVs,
            });
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
                <div className="flex items-center justify-between">
                    <Label className="font-medium">
                        Modes of Verification <span className="text-destructive">*</span>
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            form.pushFieldValue('KPIMOVs', {
                                name: '',
                                description: '',
                                fileId: '',
                            })
                        }
                        disabled={isLoading}
                        className="gap-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                    >
                        <Plus className="w-4 h-4" /> Add Mode of Verification
                    </Button>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                    <form.Subscribe
                        selector={(state) => state.values.KPIMOVs}
                        children={(movs) => (
                            <>
                                {movs.map((_, index) => (
                                    <div
                                        key={`kpi-mov-${index}`}
                                        className="p-4 border rounded-lg bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium text-sm">
                                                Mode of Verification {index + 1}
                                            </h3>
                                            {movs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => form.removeFieldValue('KPIMOVs', index)}
                                                    disabled={isLoading}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="grid gap-2">
                                                <Label className="text-sm">
                                                    Name <span className="text-destructive">*</span>
                                                </Label>
                                                <form.Field
                                                    name={`KPIMOVs[${index}].name`}
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
                                                    name={`KPIMOVs[${index}].description`}
                                                    children={(field) => (
                                                        <Textarea
                                                            value={field.state.value || ''}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            placeholder="Describe this mode of verification..."
                                                            disabled={isLoading}
                                                            rows={2}
                                                            className="w-full resize-none overflow-hidden"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label className="text-sm">File/Document</Label>
                                                <form.Field
                                                    name={`KPIMOVs[${index}].fileId`}
                                                    children={(field) => (
                                                        <FileUpload
                                                            onFileChange={(file) => {
                                                                field.handleChange('')
                                                                form.setFieldValue(`KPIMOVs[${index}].file`, file || undefined)
                                                            }}
                                                            disabled={isLoading}
                                                            acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                            maxSize={10}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
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
                            {isSubmitting ? 'Adding...' : 'Add Modes of Verification'}
                        </Button>
                    )}
                />
            </div>
        </form>
    )
}