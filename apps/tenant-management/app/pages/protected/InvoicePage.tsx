import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { FileText, Download } from "lucide-react"
import { PageContainer } from "~/components/PageContainer"
import { Separator } from "~/components/ui/separator"
import { invoices } from "~/data/invoices"

export default function InvoicesPage() {
    return (
        <PageContainer
            title="Invoices"
            description="View and download your billing history and invoices"
            action={
                <div>
                    <Input
                        type="search"
                        placeholder="Search invoices ..."
                        className="px-4"
                    />
                </div>
      }
        >
            <div className="space-y-4">
                {invoices.map((invoice) => (
                    <Card
                        key={invoice.id}
                        className="shadow-sm rounded-lg border border-gray-200"
                    >
                        <CardContent className="flex flex-col items-start justify-between p-4">
                            <div className="flex gap-4 flex-row justify-between w-full px-6">

                                <div className="flex gap-4 items-center justify-center">
                                    <div className="flex-shrink-0">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-base">{invoice.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {invoice.plan}
                                        </p>
                                    </div>
                                </div>


                                <div className="flex flex-row items-end gap-8 text-right"   >
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        <p className="text-lg font-semibold">{invoice.amount}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due {invoice.dueDate}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2 items-center justify-end">
                                        <Badge className="text-sm bg-green-400/30 border border-green-600 rounded-full text-black">     {invoice.status}
                                        </Badge>
                                        <Button size="sm" variant="outline" className="gap-1">
                                            <Download className="h-4 w-4" /> Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-6 w-full px-2" />
                            <div className="flex gap-4 px-6 flex-row justify-between w-full text-sm text-muted-foreground  ">
                                <div className="flex flex-row gap-6 ">
                                    <p>Invoice Date: {invoice.invoiceDate}</p>
                                    <p>Due Date: {invoice.dueDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Invoice ID: {invoice.invoiceId}</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        </PageContainer>
    )
}