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
    CheckCircle2,
    KeyRound,
    Database,
    Cpu,
    HardDrive,
    PackageIcon,
} from "lucide-react"
import { useNavigate } from "react-router"

export default function PackageCloudTab() {
    const navigate = useNavigate()
    return (
        <Card className="flex flex-col gap-6 p-4 border border-gray-100 dark:border-gray-700">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <PackageIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="m-0 leading-none">ERP-EZ Cloud Connector</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Cloud workspace integration specifications for hybrid environments
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col">
                    {/* Version + Deployment */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Release Channel</p>
                            <Select defaultValue="v3.0.1">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="v3.0.1">v3.0.1<Badge variant="default" className="bg-muted text-blue-600">Current</Badge></SelectItem>
                                    <SelectItem value="v2.0.0">v2.0.0</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Deployment Type</p>
                            <Badge variant="outline">Cloud</Badge>
                        </div>
                    </div>

                    {/* Enterprise Distribution Notice & License Action */}
                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-center">
                        <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                            Cloud SaaS workspaces are provisioned and updated automatically. For hybrid deployments, manage your workspace license and domain configuration in License Management.
                        </p>

                        <Button
                            onClick={() => navigate("/license-management")}
                            className="w-full sm:w-[60%] bg-[var(--button-blue)] text-white"
                        >
                            <KeyRound className="h-4 w-4 mr-2" /> View License Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Included Capabilities</CardTitle>
                        <p className="text-muted-foreground text-sm">Cloud workspace features</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            "Multi-tenant workspace isolation",
                            "Clerk SSO authentication & RBAC enforcement",
                            "Centralized module activation (AMS, PBMS, PMS)",
                            "Domain-bound license validation",
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
