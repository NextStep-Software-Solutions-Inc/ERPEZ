import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FundingSourceTab } from './tabs/FundingSourceTab';
import { OrganizationTab } from './tabs/OrganizationTab';
import { LocationTab } from './tabs/LocationTab';
import { MfoPapTab } from './tabs/MfoPapTab';
import { ObjectCodeTab } from './tabs/ObjectCodeTab';
import { ExpenseClassTab } from './tabs/ExpenseClassTab';
import { FiscalYearSelector } from '@/features/uacs/code-segments/components/FiscalYearSelector';
/**
 * Code Segments Page
 * 
 * Manages 6 core UACS elements:
 * 1. Funding Source (6 digits)
 * 2. Organization Code (12 digits)
 * 3. Location Code (9 digits)
 * 4. MFO/PAP (9 digits - PREXC aligned)
 * 5. Object Code (10 digits)
 * 6. Expense Class (PS, MOOE, CO, FE)
 */
export default function CodeSegmentsPage() {
  return (
    <TabsContent value="code-segments" className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Code Segments</h1>
        <p className="text-sm text-gray-600">
          Manage the 6 core UACS elements: Funding Source, Organization Code, Location Code, MFO/PAP, Object Code, and Expense Classes.
        </p>
      </div>

      {/* Fiscal Year Selector */}
      <FiscalYearSelector />

      <Tabs defaultValue="funding-source" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="funding-source">Funding Source</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="mfo-pap">MFO/PAP</TabsTrigger>
          <TabsTrigger value="expense-class">Expense Class</TabsTrigger>
          <TabsTrigger value="object">Object Code</TabsTrigger>
        </TabsList>
        <TabsContent value="funding-source" className="space-y-4">
          <FundingSourceTab />
        </TabsContent>
        <TabsContent value="organization" className="space-y-4">
          <OrganizationTab />
        </TabsContent>
        <TabsContent value="location" className="space-y-4">
          <LocationTab />
        </TabsContent>
        <TabsContent value="mfo-pap" className="space-y-4">
          <MfoPapTab />
        </TabsContent>
        <TabsContent value="expense-class" className="space-y-4">
          <ExpenseClassTab />
        </TabsContent>
        <TabsContent value="object" className="space-y-4">
          <ObjectCodeTab />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}
