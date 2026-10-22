import { Card, CardTitle, } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Cloud, Server, } from "lucide-react"
import { PageContainer } from "~/components/PageContainer"
import { Navigate } from "react-router"
import { useWorkspace } from "~/providers/TenantProvider"
import PackageApiTab from "~/components/tab/PackageApiTab"
import PackageCloudTab from "~/components/tab/PackageCloudTab"

export default function PackageDownloadPage() {
    const { workspace } = useWorkspace()
    const activePlan = (workspace?.tenantSubscription?.plan || "Starter").toLowerCase()
    const isStarter = activePlan.includes("starter")

    if (isStarter) {
        return <Navigate to="/overview" replace />
    }

    return (
        <PageContainer
            title="Package Downloads"
            description="Download deployment packages for your environment">
            <Tabs defaultValue="api-server" className="flex flex-col lg:flex-row gap-6 h-full">
                <Card className="flex-col flex items-start justify-start">
                    <TabsList className={`flex lg:flex-col flex-row shrink-0 rounded-xl justify-start bg-muted/10 h-full p-4 space-y-2`}>
                        <div className="flex flex-col justify-center items-center lg:justify-start lg:items-start mb-6 gap-2 ">
                            <CardTitle className="text-lg font-bold text-black">Select Package</CardTitle>
                            <p className="text-sm text-muted-foreground text-balance text-center lg:text-left leading-6">
                                Choose the deployment package for your environment.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 w-full lg:p-0 px-6">
                            <TabsTrigger
                                value="api-server"
                                className="flex flex-col items-start gap-2 w-full rounded-xl border p-4 text-left 
                                        aria-selected:border-primary border-gray-200 aria-selected:shadow-md aria-selected:bg-background 
                                        transition">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-blue-50">
                                        <Server className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="font-semibold text-balance">ERP-EZ On-Premise Server</span>
                                        <p className="text-sm text-muted-foreground text-balance">
                                            Self-hosted deployment specifications & requirements
                                        </p>
                                        <Badge variant="outline" className="mt-2">on-premise</Badge>
                                    </div>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="cloud-connector"
                                className="flex flex-col items-start gap-2 w-full rounded-xl border p-4 text-left 
                                        aria-selected:border-primary border-gray-200 aria-selected:shadow-md aria-selected:bg-background 
                                        transition">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-blue-50">
                                        <Cloud className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="font-semibold text-balance">ERP-EZ Cloud Connector</span>
                                        <p className="text-sm text-muted-foreground text-balance">
                                            Cloud deployment specifications & requirements
                                        </p>
                                        <Badge variant="outline" className="mt-2">cloud</Badge>
                                    </div>
                                </div>

                            </TabsTrigger>
                        </div>
                    </TabsList>
                </Card>
                <div className="flex-1 lg:w-[70%]">
                    <TabsContent value="api-server" className="space-y-6">
                        <PackageApiTab />
                    </TabsContent>
                    <TabsContent value="cloud-connector" className="space-y-6">
                        <PackageCloudTab />
                    </TabsContent>
                </div>
            </Tabs>
        </PageContainer>
    )
} 