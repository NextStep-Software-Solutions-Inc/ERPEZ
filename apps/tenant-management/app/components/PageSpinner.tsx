import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";

interface PageSpinnerProps {
    className?: string;
    message?: string;
    fullScreen?: boolean;
}

export default function PageSpinner({
    className,
    message = "Loading page...",
    fullScreen = false
}: PageSpinnerProps) {
    const containerClasses = fullScreen
        ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center min-h-[200px]";

    return (
        <div className={cn(containerClasses, className)}>
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <Spinner className="size-8 text-primary" />
                </div>
                {message && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                            {message}
                        </p>
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}