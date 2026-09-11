import { Link } from "react-router";
import { Building2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PageContainer } from "~/components/PageContainer";

export default function SuperAdminDeliveryUnitMigrationRoute() {
    return (
        <PageContainer
            title="Delivery Units"
            description="Operational responsibility centers, regional offices, and branches."
        >
            <div className="max-w-2xl mx-auto mt-6">
                <Card className="border-blue-200 bg-linear-to-b from-blue-50/50 to-white shadow-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                            Delivery Units Belong to Workspace Administration
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
                            Delivery Units (offices, divisions, and responsibility centers) are operational entities housed inside each workspace database. They are managed by Workspace Administrators rather than the Platform Control Plane.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-semibold">Architectural Boundary Notice:</strong>
                                <p className="mt-0.5">
                                    Platform Administrators manage customer organizations, subscriptions, and platform-level users. Operational data such as Delivery Units, employees, budgets, and requisitions remain strictly governed inside individual workspace databases.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                            <Button asChild className="btn-blue flex items-center gap-2">
                                <Link to="/delivery-unit">
                                    Go to Workspace Delivery Units
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}