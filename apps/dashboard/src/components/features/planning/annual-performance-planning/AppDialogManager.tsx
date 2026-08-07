/**
 * APP Dialog Manager
 * 
 * Orchestrates all dialog states for Annual Performance Planning workflow.
 * Manages Step 1, Step 2, Step 3 dialogs as a single entry point.
 */

import { useAtomValue } from 'jotai'
import { step1DialogAtom, step2DialogAtom, step3DialogAtom } from './atoms'

export default function AppDialogManager() {
  const step1Dialog = useAtomValue(step1DialogAtom)
  const step2Dialog = useAtomValue(step2DialogAtom)
  const step3Dialog = useAtomValue(step3DialogAtom)

  return (
    <>
      {/* Step 1 Dialog - Fiscal Year Controller */}
      {step1Dialog.isOpen && (
        <div>{/* Step 1 dialog component will render here */}</div>
      )}

      {/* Step 2 Dialog - KPI Activation */}
      {step2Dialog.isOpen && (
        <div>{/* Step 2 dialog component will render here */}</div>
      )}

      {/* Step 3 Dialog - Target Distribution */}
      {step3Dialog.isOpen && (
        <div>{/* Step 3 dialog component will render here */}</div>
      )}
    </>
  )
}
