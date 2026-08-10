import CodeSegmentsPage from './CodeSegmentsPage'
import RulesPage from './RulesPage'
import DataManagementPage from './DataManagementPage'

/**
 * UACS Main Page
 * 
 * Renders all three UACS pages (Code Segments, Rules, Data Management) unconditionally.
 * Visibility of each page is controlled by the TabsContent component in UACSLayout,
 * which shows/hides content based on the active tab selection.
 */
export default function UACSPage() {

  return (
    <>
      <CodeSegmentsPage />
      <RulesPage />
      <DataManagementPage />
    </>
  )
}
