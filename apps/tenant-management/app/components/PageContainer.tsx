import type { ReactNode } from "react"
import { useNavigate } from "react-router"

interface PageContainerProps {
    title?: string
    description?: string
    /** singular legacy prop */
    action?: ReactNode
    /** plural-friendly prop for passing multiple action elements */
    actions?: ReactNode
    children: ReactNode
    backTo?: boolean | string
}

export function PageContainer({ title, description, action, actions, children, backTo }: PageContainerProps) { 
    const actionNode = actions ?? action
    const navigate = useNavigate();
    return (
        <div className="p-2 space-y-8"> 
            <div className="flex items-center justify-between">
                <div>
                    {backTo && (
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    if (backTo === true) return navigate(-1);
                                    navigate(String(backTo));
                                }}
                                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
                            >
                                &larr; Back
                            </button>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground pt-2">{description}</p>
                    )}
                </div>
                {actionNode && <div>{actionNode}</div>}
            </div> 
            <div className="px-2">{children}</div>
        </div>
    )
}
