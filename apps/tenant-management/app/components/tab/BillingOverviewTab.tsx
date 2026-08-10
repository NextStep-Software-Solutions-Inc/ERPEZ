import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Calendar, Wallet2 } from "lucide-react"

export const BillingOverviewTab = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wallet2 className="h-5 w-5 text-[var(--button-blue)]" />
                        <CardTitle className="text-base font-semibold">Current Plan</CardTitle>
                    </div>
                    <CardDescription>Your active subscription details</CardDescription>
                </CardHeader> 
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">Enterprise</p>
                        <Badge className="bg-blue-500 text-white">Active</Badge>
                    </div>
                    <dl className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Billing Cycle</dt>
                            <dd>Monthly</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Amount</dt>
                            <dd>$0/month</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Next Billing</dt>
                            <dd>10/06/2025</dd>
                        </div>
                    </dl>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Change Plan</Button>
                </CardContent>
            </Card> 
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[var(--button-green)]" />
                        <CardTitle className="text-base font-semibold">Next Invoice</CardTitle>
                    </div>
                    <CardDescription>Upcoming billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">$0</p>
                        <Badge variant="outline">Due 10/08/2025</Badge>
                    </div>
                    <dl className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <dt>Enterprise Plan</dt>
                            <dd>Monthly</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt>Tax</dt>
                            <dd>$0</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt>Next Billing</dt>
                            <dd>$0</dd>
                        </div>
                        <div className="flex justify-between font-bold border-t border-gray-200 pt-4">

                            <dt  >Total</dt>
                            <dd>$0</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    )
}