import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangle, } from "lucide-react";

interface NotFoundProps {
    title?: string;
    description?: string;
    actions?: React.ReactNode
}

export default function NotFound({ actions, title, description }: NotFoundProps) {

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
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
                        {actions}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}