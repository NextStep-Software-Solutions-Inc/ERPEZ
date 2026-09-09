import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { getDeliveryUnitsRequest } from "~/features/delivery-unit/handlers/getDeliveryUnitsRequest";
import {
    Card
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "~/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { PageContainer } from "~/components/PageContainer";
import { Loader2 } from "lucide-react";

type DeliveryUnit = {
    id: string;
    name: string;
    address: string;
    country: string;
    contact: string;
    responsibilityCenter: string;
};

const SAMPLE_DATA: DeliveryUnit[] = [
    { id: "1", name: "North Region Company", address: "123 Industrial Park Ave", country: "Philippines", contact: "+63 912 9829 902", responsibilityCenter: "RC-NORTH-001" },
    { id: "2", name: "South Distribution Inc.", address: "123 Industrial Park Ave", country: "Philippines", contact: "+63 903 3245 234", responsibilityCenter: "IN-SOUTH-201" },
    { id: "3", name: "West Company", address: "123 Industrial Park Ave", country: "Philippines", contact: "+63 913 0989 220", responsibilityCenter: "CO-WEST-331" },
    { id: "4", name: "IT Institute", address: "123 Cyber Park Ave", country: "United States", contact: "+63 920 1929 122", responsibilityCenter: "IT-INS-002" },
    { id: "5", name: "Regional IV Company", address: "123 Industrial Park Ave", country: "United States", contact: "+63 912 2344 112", responsibilityCenter: "RC-RegionIV-001" },
];

const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest);

export default function DeliveryUnitPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [data, setData] = useState<DeliveryUnit[]>(SAMPLE_DATA);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data: duResponse, isLoading } = useDeliveryUnits({
        pathParams: {},
        queryParams: { pageSize: 50, pageNumber: 1 }
    });

    useEffect(() => {
        if (duResponse?.data && duResponse.data.length > 0) {
            const mapped = duResponse.data.map((du, idx) => ({
                id: du.id,
                name: du.name || (du as any).officeName || `Delivery Unit ${idx + 1}`,
                address: du.address || "Main Campus / Regional Office",
                country: du.country || "Philippines",
                contact: du.contact || "+63 912 000 0000",
                responsibilityCenter: du.responsibilityCenter || du.code || `RC-${(du as any).officeName ? 'OFFICE' : 'DU'}-${idx + 1}`
            }));
            setData(mapped);
        }
    }, [duResponse]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter(d =>
            d.name.toLowerCase().includes(q) ||
            d.address.toLowerCase().includes(q) ||
            d.country.toLowerCase().includes(q) ||
            d.contact.toLowerCase().includes(q) ||
            d.responsibilityCenter.toLowerCase().includes(q)
        );
    }, [data, query]);

    const allSelectedCount = Object.values(selected).filter(Boolean).length;

    function toggleRow(id: string) {
        setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function toggleSelectAll() {
        const allOn = filtered.every(r => selected[r.id]);
        const next: Record<string, boolean> = {};
        if (!allOn) {
            filtered.forEach(r => (next[r.id] = true));
        }
        setSelected(next);
    }

    function handleAdd(newUnit: Partial<DeliveryUnit>) {
        const id = String(Date.now());
        setData(prev => [{ id, name: newUnit.name || "New Unit", address: newUnit.address || "", country: newUnit.country || "", contact: newUnit.contact || "", responsibilityCenter: newUnit.responsibilityCenter || "" }, ...prev]);
        setIsAddOpen(false);
    }

    return (
        <PageContainer title="Delivery Units" description="Manage your organization's delivery units here.">
            <div>
                <div className="flex items-start justify-between mb-6">


                    <div className="flex items-center gap-3">
                        <Input placeholder="Search tenants ..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} className="min-w-[260px]" />
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">+ Add Delivery Unit</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px]">
                                <DialogHeader>
                                    <DialogTitle>Add Delivery Unit</DialogTitle>
                                </DialogHeader>
                                <AddDeliveryUnitForm onSave={handleAdd} onCancel={() => setIsAddOpen(false)} />
                                <DialogClose />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="p-0">
                    <ScrollArea>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Checkbox
                                            checked={filtered.length > 0 && filtered.every(r => selected[r.id])}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Delivery Unit Name</TableHead>
                                    <TableHead>Office Address</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Contact No</TableHead>
                                    <TableHead>Responsibility Center</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(row => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Checkbox checked={!!selected[row.id]} onCheckedChange={() => toggleRow(row.id)} />
                                        </TableCell>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell>{row.address}</TableCell>
                                        <TableCell>{row.country}</TableCell>
                                        <TableCell>{row.contact}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{row.responsibilityCenter}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => navigate(`${row.id}/edit`)}>Edit</Button>
                                                <Button size="sm" variant="link" onClick={() => navigate(`${row.id}`)}>Details</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Card>

                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <div>{allSelectedCount} of {filtered.length} row(s) selected.</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

/* Small controlled form used inside the dialog */
function AddDeliveryUnitForm({ onSave, onCancel }: { onSave: (u: Partial<DeliveryUnit>) => void; onCancel: () => void; }) {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [contact, setContact] = useState("");
    const [rc, setRc] = useState("");

    return (
        <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Name</label>
                <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Address</label>
                <Input value={address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Country</label>
                <Input value={country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Contact</label>
                <Input value={contact} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Responsibility Center</label>
                <Input value={rc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave({ name, address, country, contact, responsibilityCenter: rc })}>Save</Button>
            </div>
        </div>
    );
}