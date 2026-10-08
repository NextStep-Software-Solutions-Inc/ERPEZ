import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface UnauthorizedProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export default function Unauthorized({
    title = "Access Denied",
    description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
    action
}: UnauthorizedProps) {
    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleReload}
                            className="w-full"
                            variant="outline"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reload Page
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go to Home
                        </Button>
                        {action && <div className="mt-2">{action}</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}