import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Switch } from "~/components/ui/switch"
import { Separator } from "~/components/ui/separator"
import { Settings, FileText, CalendarClockIcon, Calendar, CalendarDaysIcon, CalendarFold } from "lucide-react"
import { PageContainer } from "~/components/PageContainer"
import { Button } from "~/components/ui/button"
import { Link } from "react-router"

export default function SubscriptionPage() {
    return (
        <PageContainer
            title="Subscription  "
            description="Manage your subscription preferences and billing settings"
        >
            <div className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[var(--button-blue)]" />
                            <CardTitle className="text-lg">Current Subscription</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your active subscription details and status
                        </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Plan</p>
                            <p className="font-medium">Enterprise</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Next Billing</p>
                            <p className="font-medium">10/9/2025</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                Active
                            </Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Auto Renew</p>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                Enabled
                            </Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Billing Cycle</p>
                            <p className="font-medium">Monthly</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">$99.00 per month</p>
                        </div>
                    </CardContent>
                </Card> 
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-[var(--button-blue)]" />
                            <CardTitle className="text-lg">Subscription Settings </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Configure your subscription preferences
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            {
                                label: "Auto Renewal",
                                desc: "Automatically renew your subscription at the end of each billing period",
                            },
                            {
                                label: "Email Notification",
                                desc: "Receive email updates about your subscription and billing",
                            },
                            {
                                label: "Usage Alerts",
                                desc: "Get notified when you’re approaching your usage limits",
                            },
                            {
                                label: "Invoice Reminders",
                                desc: "Receive reminders about upcoming and overdue invoices",
                            },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Switch />
                                </div>
                                {idx < 3 && <Separator className="my-4" />}
                            </div>
                        ))}
                    </CardContent>
                </Card> 
                <Card className="shadow-sm ">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CalendarFold className="h-5 w-5 text-[var(--button-blue)]" />
                            <CardTitle className="text-lg">Billing Cycle</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Change your billing frequency
                        </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="border rounded-md p-4 flex justify-between border-blue-500">
                            <div>
                                <h3 className="font-medium text-lg">Monthly</h3>
                                <p className="text-sm text-muted-foreground">Billed every month</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">$ 99</p>
                                <p className="text-sm text-muted-foreground">per month</p>
                            </div>
                        </div> 
                        <div className="border rounded-md p-4 flex justify-between">
                            <div>
                                <h3 className="font-medium text-lg">Annual</h3>
                                <p className="text-sm text-muted-foreground">Billed yearly (Save 17%)</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">$ 990</p>
                                <p className="text-sm text-muted-foreground">per year</p>
                            </div>
                        </div>
                    </CardContent>
                </Card> 
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Subscription Actions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage your subscription status
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                            <Link to="/plan" className="flex-1 no-underline text-inherit items-center justify-center text-center">
                                <Button className="w-full bg-blue-600 text-white rounded-md py-3 px-4 text-center font-medium hover:bg-blue-700">
                                Change Plan
                                </Button>
                            </Link>
                            <Button className=" bg-white border rounded-md py-3 px-4 text-center font-medium text-black hover:bg-gray-50">
                                Reactivate
                            </Button>
                            <Button className="bg-red-600 text-white rounded-md py-3 px-4 text-center font-medium hover:bg-red-700">
                                Cancel Subscription
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Cancelling your subscription will downgrade you to the free trial at the end of your current billing period
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}
