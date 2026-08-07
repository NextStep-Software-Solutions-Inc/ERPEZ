import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Plus, Wallet } from "lucide-react"
export default function BillingPaymentTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <p className="text-muted-foreground">
                    Manage your payment methods and billing information
                </p>
            </div>

            <Card>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                        <p className="text-lg font-semibold">No Payment Methods</p>
                        <p className="text-sm text-muted-foreground">
                            Add a payment method to manage your subscription
                        </p>
                    </div>

                    <Button className="w-full md:w-1/3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Add Payment Method
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}