import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Props {
    value: string;
    onChange: (val: string) => void;
    plans?: string[];
}

export function TenantFilterTab({ value, onChange, plans }: Props) {
    const defaultPlans = ["All", "Starter", "Professional", "Enterprise"];
    const tabs = plans && plans.length > 0 ? plans : defaultPlans;
    return (
        <Tabs value={value} onValueChange={onChange}>
            <TabsList>
                {tabs.map((p) => (
                    <TabsTrigger key={p} value={p}>
                        {p}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
