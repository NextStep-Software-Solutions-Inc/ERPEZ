import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import {
    Calendar,
    HardDrive,
    FileArchive,
    CheckCircle2,
    Download,
    Database,
    Cpu,
    PackageIcon,
} from "lucide-react"

export default function PackageCloudTab() {
    return (
        <Card className="flex flex-col gap-6 p-4 border border-gray-100 dark:border-gray-700">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <PackageIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="m-0 leading-none">TenantFlow Cloud Connector</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Cloud deployment package with auto-scaling capabilities
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col">
                    {/* Version + Deployment */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Version</p>
                            <Select defaultValue="v3.0.1">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="v3.0.1">v3.0.1<Badge variant="default" className="bg-muted text-blue-600">Latest</Badge></SelectItem>
                                    <SelectItem value="v2.0.0">v2.0.0</SelectItem>
                                    <SelectItem value="v1.9.0">v1.9.0</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Deployment Type</p>
                            <Badge variant="outline">Cloud</Badge>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col gap-6 p-4 items-center justify-center">
                        <div className="flex items-center  text-sm text-muted-foreground w-full justify-between px-12">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> 2025-02-15
                            </div>
                            <div className="flex items-center gap-1">
                                <HardDrive className="h-4 w-4" /> 45.2MB
                            </div>
                            <div className="flex items-center gap-1">
                                <FileArchive className="h-4 w-4" /> ZIP Archive
                            </div>
                        </div>

                        {/* Download Button */}
                        <Button className="w-[60%] bg-[var(--button-blue)]">
                            <Download className="h-4 w-4 mr-2" /> Download v3.0.1
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>What's New</CardTitle>
                        <p className="text-muted-foreground text-sm">Changes in v3.0.1</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            "New authentication endpoints",
                            "Rate limiting improvements",
                            "Enhanced error handling",
                            "API documentation updates",
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                {item}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Requirements</CardTitle>
                        <p className="text-muted-foreground text-sm">Minimum requirements for deployment</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" /> Node.js 18+ or Docker
                        </div>
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary" /> PostgreSQL 13+ / MySQL 8+
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" /> 1 CPU core minimum
                        </div>
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-primary" /> 4GB RAM minimum
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    )
}
