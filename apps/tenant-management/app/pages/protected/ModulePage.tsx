import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { User, ShoppingCart, NotepadText, PackageOpen } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import React from "react";
import { initialModules } from "~/data/module/initialModule";
import { PageContainer } from "~/components/PageContainer";

export default function ModulePage() {
    const [modules, setModules] = React.useState(initialModules);

    const toggleModule = (id: string, checked?: boolean) => {
        setModules((prev) =>
            prev.map((m) =>
                m.id === id
                    ? {
                        ...m,
                        enabled: typeof checked === "boolean" ? checked : !m.enabled,
                    }
                    : m
            )
        );
    };
    const activeCount = modules.filter((m) => m.enabled).length;
    return (
        <PageContainer
            title="Module Management"
            description="List of modules that your organization needs."
            action={
                <div className="text-sm font-medium px-4">
                    Active Modules{" "}
                    <span className="text-blue-600">
                        {activeCount}/{modules.length}
                    </span>
                </div>
                }>
            <div className="flex flex-col gap-10">
                <div
                    className="rounded-lg bg-gradient-to-l from-[var(--button-green)]/40 to-[var(--button-blue)]/40 p-4"
                    style={{ borderLeft: "8px solid #2563EB66" }}
                >
                    <text className="justify-start text-blue-900 text-base font-bold font-['Inter'] leading-loose">Module Overview</text>
                    <p className="text-sm text-[#1E3A8A]">
                        Choose from our comprehensive suite of business management modules.
                        Each module integrates seamlessly with others to provide a complete
                        ERP solution.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    {modules.map((mod) => (
                        <Card key={mod.id} className={`relative ${!mod.enabled ? '' : 'bg-gradient-to-t from-[var(--button-green)]/10 to-[var(--button-blue)]/10'}`}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-gradient-to-tl from-[var(--button-green)]/20 to-[var(--button-blue)]/20">
                                        {mod.id === "ams" && <User className="h-6 w-6 text-blue-500" />}
                                        {mod.id === "planning" && <NotepadText className="h-6 w-6 text-blue-500" />}
                                        {mod.id === "pms" && <ShoppingCart className="h-6 w-6 text-blue-500" />}
                                        {mod.id === "sams" && <PackageOpen className="h-6 w-6 text-blue-500" />}
                                    </div>

                                    <CardTitle className="text-sm font-semibold">
                                        {mod.title}
                                    </CardTitle>
                                </div>
                                <Switch
                                    checked={mod.enabled}
                                    disabled={mod.id === "ams"}
                                    onCheckedChange={(checked) => {
                                        if (mod.id === "ams") return;
                                        toggleModule(mod.id, checked);
                                    }}
                                    aria-label={mod.id === "ams" ? `${mod.title} (disabled)` : undefined}
                                    className="data-[state=checked]:bg-blue-700"
                                />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {mod.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
}
