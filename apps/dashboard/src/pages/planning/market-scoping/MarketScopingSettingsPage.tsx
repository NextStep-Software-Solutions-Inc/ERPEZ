/**
 * Market Scoping Settings Page
 * URL: /v2/market-scoping/settings
 * 
 * Unified settings page for managing Market Scoping configuration
 * Includes tabs for Activity Types and Parameters
 */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ManageActivityTypesPage from './ManageActivityTypesPage'
import ManageParametersPage from './ManageParametersPage'

export default function MarketScopingSettingsPage() {
  const [activeTab, setActiveTab] = useState('activities')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Scoping Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage activity types and evaluation parameters for market scoping
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="activities">Activity Types</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          <ManageActivityTypesPage />
        </TabsContent>

        <TabsContent value="parameters" className="mt-6">
          <ManageParametersPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
