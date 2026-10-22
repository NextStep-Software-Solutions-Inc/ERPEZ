/**
 * PageContainerDashtail
 * A flexible, Dashtail-styled container component for /v2 pages
 * Supports multiple layout patterns: simple pages, tabbed layouts, tables, multi-section pages
 * Ensures consistent design with Dashtail theme and styling
 *
 * Features:
 * - Flexible header with title, description, and action slots
 * - Built-in tab navigation with URL search param integration
 * - Multiple tab style variants (default, underline, bordered, soft, rounded)
 * - Animated tab transitions with direction-aware slide effects
 * - Support for different layout modes
 * - Dashtail theme colors and spacing
 * - Responsive design with Tailwind CSS
 */

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useCanGoBack } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pageAnimations, tabAnimations } from '@/utils/animation'
import type { FileRoutesByTo } from '@/routeTree.gen'

export type PageLayoutMode = 'simple' | 'tabbed' | 'withTable' | 'multiSection'

export type ContentType = 'table' | 'cards' | 'accordion' | 'default'

export type TabVariant =
  | 'default'
  | 'underline'
  | 'bordered'
  | 'soft'
  | 'rounded'

export interface TabConfig {
  id: string
  label: string
  description?: string
  contentType?: ContentType
  icon?: ReactNode
}

// default icon and title size variants default 2xl, configurable by passing titleIcon as a ReactNode and styling it accordingly. This allows for flexibility in header design while maintaining a consistent structure.

const headerSizeVariants = {
  default: 'text-2xl',
  large: 'text-3xl',
  small: 'text-xl',
  extraSmall: 'text-lg',
}
export interface PageContainerDashtailProps {
  /** Page title */
  title?: ReactNode
  /** Page Header icon + title can be used together for a more visual header */
  titleIcon?: ReactNode
  /** Status/category badge to render next to the title */
  badge?: ReactNode
  /** Page description/subtitle */
  description?: string
  /** Custom metadata elements to render below the title/description */
  metadata?: ReactNode
  /** Layout mode affecting spacing and structure */
  mode?: PageLayoutMode
  /** Content type for layout adjustments (table removes padding, etc.) */
  contentType?: ContentType
  /** Tab configuration array for tabbed mode */
  tabs?: TabConfig[]
  /** Current active tab value (for controlled tabs) */
  activeTab?: string
  /** Callback when tab changes - receives new tab id */
  onTabChange?: (tabId: string) => void
  /** Tab style variant */
  tabVariant?: TabVariant
  /** Enable animated tab transitions */
  animateTabs?: boolean
  /** Loading state for tab content */
  isLoadingTab?: boolean
  /** Content to render after tabs (right side, for secondary navigation) */
  afterTabs?: ReactNode
  breadcrumbs?: ReactNode
  /** Action elements for header (right side) */
  actions?: ReactNode
  /** Header presentation variant */
  headerVariant?: 'default' | 'branded'
  /** action presentation variant*/
  actionButtonVariant?: 'default' | 'branded'
  /** Back navigation configuration */
  backTo?:
  | boolean
  | keyof FileRoutesByTo
  | {
    to: keyof FileRoutesByTo
    search?: Record<string, string>
    params?: string
  }
  /** Custom label for back button */
  backLabel?: string
  /**
   * Header title size variant
   * - default (text-2xl): Standard header size for most pages
   * - large (text-3xl): For detail pages or primary sections
   * - small (text-xl): For nested/secondary pages
   * - extraSmall (text-lg): For sidebar layouts or constrained spaces
   */
  headerSize?: 'default' | 'large' | 'small' | 'extraSmall'
  /** Child content */
  children: ReactNode
  /** Additional className for container */
  containerClassName?: string
  /** Additional className for content area */
  contentClassName?: string
}

export function PageContainerDashtail({
  title,
  titleIcon,
  badge,
  description,
  metadata,
  mode = 'simple',
  contentType = 'default',
  tabs,
  activeTab,
  onTabChange,
  tabVariant = 'underline',
  animateTabs = true,
  isLoadingTab = false,
  afterTabs,
  breadcrumbs,
  actions,
  headerVariant = 'default',
  actionButtonVariant = 'default',
  backTo,
  backLabel,
  headerSize = 'default',
  children,
  containerClassName,
  contentClassName,
}: PageContainerDashtailProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const [tabDirection, setTabDirection] = useState(0)
  const [previousTab, setPreviousTab] = useState<string | undefined>(activeTab)

  // Track tab direction for directional animations
  useEffect(() => {
    if (activeTab && previousTab && activeTab !== previousTab) {
      const currentIndex = tabs?.findIndex((t) => t.id === activeTab) ?? 0
      const previousIndex = tabs?.findIndex((t) => t.id === previousTab) ?? 0
      setTabDirection(currentIndex > previousIndex ? 1 : -1)
      setPreviousTab(activeTab)
    }
  }, [activeTab, tabs, previousTab])

  /**
   * Handle tab changes with optional search param synchronization
   */
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  /**
   * Render tabs section for tabbed mode with animations and variants
   */
  const renderTabs = () => {
    if (!tabs || tabs.length === 0 || !activeTab) {
      return null
    }

    const isUnderlineVariant = tabVariant === 'underline'
    const isBorderedVariant = tabVariant === 'bordered'
    const isSoftVariant = tabVariant === 'soft'
    const isRoundedVariant = tabVariant === 'rounded'

    return (
      <motion.div
        className={cn(
          isUnderlineVariant && 'border-b border-border',
          !isUnderlineVariant && 'border-b-0',
          'px-2.5',
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <motion.div
            variants={tabAnimations.tabListStagger}
            initial="hidden"
            animate="show"
            className="flex items-center"
          >
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <TabsList
                variant={tabVariant}
                className={cn(isUnderlineVariant && 'border-b-0')}
              >
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    variants={tabAnimations.tabTrigger}
                    custom={index}
                    initial="hidden"
                    animate="show"
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TabsTrigger
                      value={tab.id}
                      variant={tabVariant}
                      className={cn(
                        'group relative transition-all duration-200',
                        tabVariant === 'underline' && 'text-sm',
                        // Hover effects based on variant
                        isUnderlineVariant &&
                        'hover:text-foreground hover:shadow-sm',
                        isBorderedVariant &&
                        'hover:bg-accent/50 hover:shadow-md',
                        isSoftVariant && 'hover:bg-accent hover:shadow-sm',
                        isRoundedVariant &&
                        'hover:bg-primary/10 hover:shadow-md',
                      )}
                    >
                      {/* Animated underline for underline variant */}
                      {isUnderlineVariant && (
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                          initial={{ scaleX: 0, originX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{
                            duration: 0.3,
                            ease: 'easeOut',
                          }}
                          style={{ display: 'none' }}
                        />
                      )}

                      {tab.icon && (
                        <motion.span
                          className="mr-2 inline-flex"
                          whileHover={{
                            scale: 1.15,
                            rotate: 2,
                          }}
                          whileTap={{ scale: 0.9 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 10,
                          }}
                        >
                          {tab.icon}
                        </motion.span>
                      )}

                      {/* Hover glow effect for rounded variant */}
                      {isRoundedVariant && (
                        <motion.div
                          className="absolute inset-0 -z-10 rounded-md bg-primary/5 opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {tab.label}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
            </div>
            {afterTabs && (
              <div className="flex items-center shrink-0 ml-auto min-w-0 max-w-full overflow-x-auto">
                <div className="w-px h-6 bg-border mx-3 shrink-0" />
                {afterTabs}
              </div>
            )}
          </motion.div>
        </Tabs>
      </motion.div>
    )
  }

  /**
   * Layout modes determine spacing and structure
   * Spacing is adjusted based on contentType for better layout
   */
  const modeClasses = {
    simple:
      contentType === 'default'
        ? 'space-y-0'
        : contentType === 'table'
          ? 'space-y-4'
          : 'space-y-6',
    tabbed: 'space-y-0',
    withTable: 'space-y-4',
    multiSection: contentType === 'table' ? 'space-y-6' : 'space-y-8',
  }

  const containerClasses = cn('w-full min-w-0', modeClasses[mode], containerClassName)

  const contentClasses = cn(
    'w-full min-w-0',
    mode === 'tabbed' ? 'py-6' : contentType === 'default' ? 'p-0' : 'py-6',
    contentType === 'table' ||
      contentType === 'cards' ||
      contentType === 'accordion'
      ? 'px-0'
      : contentType === 'default'
        ? ''
        : 'px-6',
    contentClassName,
  )

  const headerCardClasses = cn(
    'mb-6 overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.08] via-primary/[0.05] to-transparent text-foreground shadow-sm shadow-primary/2 rounded-xl',
  )

  const headerSection = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        {breadcrumbs ? (
          <div className="mb-3">{breadcrumbs}</div>
        ) : backTo ? (
          <div className="mb-4 flex items-center">
            <Button
              variant="outline"
              className={cn(
                'p-2 text-sm font-semibold transition-colors flex items-center gap-1.5 h-8',
                headerVariant === 'branded'
                  ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary'
                  : 'border-border text-foreground hover:bg-muted'
              )}
              onClick={() => {
                if (typeof backTo === 'string') {
                  router.navigate({ to: backTo })
                } else if (typeof backTo === 'object') {
                  router.navigate(backTo)
                } else {
                  if (!canGoBack) return
                  router.history.back()
                }
              }}
              disabled={backTo === true && !canGoBack}
            >
              {backLabel ? (
                <>
                  <MoveLeft className="h-4 w-4" /> {backLabel}
                </>
              ) : (
                <>
                  <MoveLeft className="h-4 w-4" /> Back
                </>
              )}
            </Button>
          </div>
        ) : null}
        <div className="flex items-start gap-4">
          {titleIcon && (
            <div
              className={cn(
                'flex items-center shrink-0 mt-0.5',
                headerVariant === 'branded'
                  ? 'text-primary [&_svg]:text-primary'
                  : 'text-primary'
              )}
            >
              {titleIcon}
            </div>
          )}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {title && (
                headerVariant === 'branded' ? (
                  <CardTitle className="text-3xl font-bold tracking-tight leading-tight text-primary">
                    {title}
                  </CardTitle>
                ) : (
                  <h1
                    className={cn(
                      'font-bold tracking-tight text-foreground leading-tight',
                      headerSizeVariants[headerSize],
                    )}
                  >
                    {title}
                  </h1>
                )
              )}
              {badge && <div className="flex items-center shrink-0">{badge}</div>}
            </div>
            {description && (
              <p
                className={cn(
                  'text-sm leading-relaxed text-muted-foreground'
                )}
              >
                {description}
              </p>
            )}
            {metadata && (
              <div
                className={cn(
                  'pt-2 flex flex-wrap items-center gap-4 text-xs font-medium',
                  headerVariant === 'branded'
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-muted-foreground'
                )}
              >
                {metadata}
              </div>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div
          className={cn(
            'flex h-fit shrink-0 flex-wrap items-center gap-2 sm:self-start',
            actionButtonVariant === 'branded'
              ? `
      [&_button]:border-primary/20
      [&_button]:bg-primary/5
      [&_button]:text-primary
      [&_button:hover]:bg-primary/10

      [&_svg]:text-primary

      [&_a]:border-primary/20
      [&_a]:bg-primary/5
      [&_a]:text-primary
      [&_a:hover]:bg-primary/10

      [&_.badge]:border-primary/20
      [&_.badge]:bg-primary/5
      [&_.badge]:text-primary
    `
              : ''
          )}
        >
          {actions}
        </div>
      )}
    </div>
  )

  const headerContent =
    headerVariant === 'branded' ? (
      <Card className={headerCardClasses}>
        <CardHeader className="mb-0 border-0">{headerSection}</CardHeader>
      </Card>
    ) : (
      headerSection
    )

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={pageAnimations.pageEnter}
      className={containerClasses}
    >
      {/* Header Section */}
      {backTo || title || description || actions ? headerContent : null}

      {/* Tabs Navigation */}
      {mode === 'tabbed' && tabs && tabs.length > 0 && (
        <div className="mt-6">{renderTabs()}</div>
      )}

      {/* Content Section with Animated Transitions */}
      <AnimatePresence mode="wait">
        {isLoadingTab ? (
          <motion.div
            key="loading"
            className={contentClasses}
            variants={tabAnimations.contentLoading}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <div className="flex items-center justify-center py-12">
              <div className="space-y-4 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab || 'content'}
            className={contentClasses}
            custom={tabDirection}
            variants={
              animateTabs && mode === 'tabbed'
                ? tabAnimations.contentSlide
                : tabAnimations.contentFade
            }
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
              },
              opacity: {
                duration: 0.2,
              },
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * TabsRenderer Component
 * Enhanced composable component for integrating PageContainerDashtail with tab content
 * Handles Suspense wrapping, lazy loading, and animated transitions per tab
 *
 * Usage:
 * <TabsRenderer
 *   isLoading={isLoadingTab}
 *   fallback={<Spinner />}
 *   animated={true}
 * >
 *   {tabContent}
 * </TabsRenderer>
 */
export function TabsRenderer({
  children,
  fallback,
  isLoading = false,
  animated = true,
}: {
  children: ReactNode
  fallback?: ReactNode
  isLoading?: boolean
  animated?: boolean
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && fallback ? (
        <motion.div
          key="fallback"
          variants={tabAnimations.contentLoading}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="flex items-center justify-center py-12"
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={
            animated
              ? tabAnimations.contentFade
              : { hidden: {}, show: {}, exit: {} }
          }
          initial="hidden"
          animate="show"
          exit="hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageContainerDashtail
