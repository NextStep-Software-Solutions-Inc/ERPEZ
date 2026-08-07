/**
 * PolicySidebarLayout
 * Content wrapper for sub-features under a specific domain.
 * Navigation is now handled by PageContainerDashtail (afterTabs).
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PolicyDomain } from '@/routes/v2/fiscal-year-and-policies/_constants'
import { tabAnimations } from '@/utils/animation'

interface PolicySidebarLayoutProps {
  /** The current active domain (preserved for prop consistency) */
  activeDomain: PolicyDomain
  /** The current active sub-feature tab */
  activeTab: string
  /** The main content (page) for the selected sub-feature */
  children: React.ReactNode
}

export function PolicySidebarLayout({
  activeTab,
  children,
}: PolicySidebarLayoutProps) {
  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-250px)]">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={tabAnimations.contentFade}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
