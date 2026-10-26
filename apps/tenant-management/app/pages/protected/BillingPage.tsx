import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { PageContainer } from "~/components/PageContainer";
import { BillingOverviewTab } from "~/components/tab/BillingOverviewTab";
import BillingPaymentTab from "~/components/tab/BillingPaymentTab";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <PageContainer
      title="Billing & Subscription"
      description="Manage your subscription, payment methods, and billing information"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4">
          <BillingOverviewTab onSwitchToPaymentTab={() => setActiveTab("payment")} />
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="pt-4">
          <BillingPaymentTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
