
import { PageContainer } from "~/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { OverviewChart } from "~/components/OverviewChart";
import { StatCard } from "~/components/StatCard";
import { Users, CreditCard, Layers, CalendarDays } from "lucide-react";

export default function SuperAdminOverviewPage() {
    const stats = [
        { label: "Monthly Revenue", value: "$ 99.00", icon: CreditCard },
        { label: "Active User", value: "1", icon: Users },
        { label: "Modules", value: "2", icon: Layers },
        { label: "Member Since", value: "2024", icon: CalendarDays },
    ];

    return (
        <PageContainer
            title="Overview"
            description="Welcome back! Manage your tenant operations."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Line Chart - Interactive</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing total visitors for the last 3 months
                    </p>
                </CardHeader>
                <CardContent>
                    <OverviewChart />
                </CardContent>
            </Card>
        </PageContainer>
    );
}
