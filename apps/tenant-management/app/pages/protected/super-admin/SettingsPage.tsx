import React, { useState } from "react";
import { PageContainer } from '~/components/PageContainer';
import { Card } from '~/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { Avatar } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';

function SettingsPage() {
    const [tab, setTab] = useState<string>('account');
    const [editing, setEditing] = useState(false);

    // profile form state (local only - replace with real data / API)
    const [fullName, setFullName] = useState('Super Admin');
    const [email, setEmail] = useState('admin@tenant.com');
    const [phone, setPhone] = useState('+1 234 567 8900');
    const [company, setCompany] = useState('Nextstep Software Solution Inc.');
    const [address, setAddress] = useState('Lapasan, Cagayan de Oro City, Philippines');
    const [postal, setPostal] = useState('9000');

    function onEditToggle() {
        setEditing(v => !v);
    }

    function onSave() {
        // TODO: send to API
        setEditing(false);
    }

    function onCancel() {
        // TODO: revert to last saved values (fetch if needed)
        setEditing(false);
    }

    return (
        <PageContainer title="Settings" description="Manage your account settings">
            <div className="space-y-6">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="pt-4">
                        <Card className="p-6">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <div className="h-10 w-10 flex items-center justify-center rounded bg-muted text-muted-foreground">SA</div>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-medium">Super Admin</h3>
                                            <Badge variant="secondary">System Administrator</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">admin@tenant.com</p>
                                        <p className="text-xs text-muted-foreground mt-1">Tenant ID: tent_h670csr93</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!editing ? (
                                        <Button onClick={onEditToggle}>Edit Profile</Button>
                                    ) : (
                                        <>
                                            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                                            <Button onClick={onSave}>Save</Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} disabled={!editing} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={!editing} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} disabled={!editing} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input value={company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)} disabled={!editing} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input value={address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} disabled={!editing} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Postal Code</Label>
                                    <Input value={postal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostal(e.target.value)} disabled={!editing} />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="pt-4">
                        <Card className="p-6">
                            <h4 className="text-sm font-semibold mb-3">Security</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">Update your account password regularly.</p>
                                    </div>
                                    <div>
                                        <Button size="sm">Change</Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Two‑Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Secure your account with an extra layer of protection.</p>
                                    </div>
                                    <div>
                                        <Button size="sm" variant="outline">Manage</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    );
}

export default SettingsPage; 