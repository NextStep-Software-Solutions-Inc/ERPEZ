import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { CheckCircle2, Copy, FileKey } from "lucide-react"
import { PageContainer } from "~/components/PageContainer"

export default function LicenseManagementPage() {
    return (
        <PageContainer
            title="License Management"
            description="Manage your software licenses and deployment configuration"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current License */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileKey className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Current License</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your active license information and status
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-y-2">
                            <div>
                                <p className="text-muted-foreground">License Type</p>
                                <Badge variant="secondary">Free Trial</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Active
                                </Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Max Users</p>
                                <p className="font-medium">5</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Expires</p>
                                <p className="font-medium">10/8/2025</p>
                            </div>
                        </div>

                        {/* License Key */}
                        <div className="space-y-2">
                            <p className="font-medium">License Key</p>
                            <div className="flex gap-2">
                                <Input
                                    value="TRIAL - TENANT_D8K1QOUXM"
                                    readOnly
                                    className="text-xs"
                                />
                                <Button variant="outline" size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <p className="font-medium">Features</p>
                            <ul className="space-y-1">
                                {[
                                    "Up to 50 users",
                                    "Advanced financial reporting",
                                    "Supply chain management",
                                    "Project management",
                                    "Priority support",
                                ].map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* License History */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">License History</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Track your license activation and changes
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <p>
                                <span className="font-medium">Current License Activated</span>{" "}
                                <br />
                                track license - 9/24/2025
                            </p>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                Active
                            </Badge>
                        </div>
                        <Separator />
                        <p className="text-muted-foreground text-sm">
                            License History will appear here after upgrading from trial
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}
