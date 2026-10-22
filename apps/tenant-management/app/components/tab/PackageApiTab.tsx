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

export default function PackageApiTab() {
    const navigate = useNavigate()
    return (
        <Card className="flex flex-col gap-6 p-4 border border-gray-100 dark:border-gray-700">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <PackageIcon className="h-6 w-6 text-primary" />
                        <CardTitle className="m-0 leading-none">ERP-EZ On-Premise Server</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Self-hosted ERP-EZ deployment package for dedicated infrastructure
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col">
                    {/* Version + Deployment */}
                    <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Release Channel</p>
                            <Select defaultValue="v2.1.0">
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="v2.1.0">
                                        <span className="flex items-center gap-2">
                                            v2.1.0
                                            <Badge variant="default" className="bg-muted text-blue-600">Current</Badge>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="v2.0.0">v2.0.0</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col items-start justify-start gap-2">
                            <p className="text-sm font-medium">Deployment Type</p>
                            <Badge variant="outline">on-premise</Badge>
                        </div>
                    </div>

                    {/* Enterprise Distribution Notice & License Action */}
                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-center">
                        <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                            On-Premise server container images and installer bundles are provisioned directly during enterprise onboarding. You can manage your domain-bound cryptographic license key and download your <code className="font-mono text-slate-800">.lic</code> certificate in License Management.
                        </p>

                        <Button
                            onClick={() => navigate("/license-management")}
                            className="w-full sm:w-[60%] bg-[var(--button-blue)] text-white"
                        >
                            <KeyRound className="h-4 w-4 mr-2" /> Manage License & Download .lic
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Included Capabilities</CardTitle>
                        <p className="text-muted-foreground text-sm">Core modules in this release</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {[
                            "AMS role-based access & workspace governance",
                            "PBMS strategic planning & budget preparation",
                            "PMS requisition, bidding & purchase order workflows",
                            "HMAC-SHA256 domain-bound license verification",
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
