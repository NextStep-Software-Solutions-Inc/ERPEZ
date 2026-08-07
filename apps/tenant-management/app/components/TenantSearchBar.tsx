import { Input } from "~/components/ui/input";

interface Props {
    value: string;
    onChange: (val: string) => void;
}

export function TenantSearchBar({ value, onChange }: Props) {
    return (
        <Input
            placeholder="Search tenants..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="max-w-sm"
        />
    );
}
