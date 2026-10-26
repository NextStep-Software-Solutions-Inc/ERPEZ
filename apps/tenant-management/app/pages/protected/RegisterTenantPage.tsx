import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function RegisterTenantPage() {
    const [tenantName, setTenantName] = useState("");
    const [tenantId, setTenantId] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tenantName && tenantId) {
            const tenantData = { name: tenantName, id: tenantId };
            localStorage.setItem("tenant", JSON.stringify(tenantData));
            navigate("/overview");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="tenantName">Tenant Name</Label>
                            <Input
                                id="tenantName"
                                type="text"
                                value={tenantName}
                                onChange={(e) => setTenantName(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}