/**
 * Organizational Structure Feature
 *
 * This module provides a comprehensive organizational structure management system with:
 * - Centralized dialog management via Jotai atoms
 * - Type-safe API request handlers
 * - Reusable form components
 * - Table utilities for data display
 *
 * Usage:
 * import { OrganizationalStructureDialogManager } from '~/components/features/planning/organizational-structure'
 */

// Dialog Manager
export { default as OrganizationalStructureDialogManager } from './OrganizationalStructureDialogManager'

// Atoms and State
export {
  dialogStatesAtom,
  createOfficeDialogAtom,
  updateOfficeDialogAtom,
  deleteOfficeDialogAtom,
  createPositionDialogAtom,
  updatePositionDialogAtom,
  deletePositionDialogAtom,
  createPersonnelDialogAtom,
  updatePersonnelDialogAtom,
  deletePersonnelDialogAtom,
  pmtBodyDialogAtom,
  formDataAtom,
  tableStatesAtom,
  // Storage keys
  CREATE_OFFICE_FORM_STORAGE_KEY,
  UPDATE_OFFICE_FORM_STORAGE_KEY,
  CREATE_POSITION_FORM_STORAGE_KEY,
  UPDATE_POSITION_FORM_STORAGE_KEY,
  CREATE_PERSONNEL_FORM_STORAGE_KEY,
  UPDATE_PERSONNEL_FORM_STORAGE_KEY,
  type DialogStates,
  type FormData,
  type TableStates,
} from './atoms'

// Dialogs
export { default as CreateOfficeDialog } from './dialog/CreateOfficeDialog'
export { default as UpdateOfficeDialog } from './dialog/UpdateOfficeDialog'
export { default as DeleteOfficeDialog } from './dialog/DeleteOfficeDialog'
export { default as CreatePositionDialog } from './dialog/CreatePositionDialog'
export { default as UpdatePositionDialog } from './dialog/UpdatePositionDialog'
export { default as CreatePersonnelDialog } from './dialog/CreatePersonnelDialog'
export { default as UpdatePersonnelDialog } from './dialog/UpdatePersonnelDialog'
export { default as PMTBodyDialog } from './dialog/PMTBodyDialog'

// Forms (exported as named exports following the pattern)
export { CreateOfficeForm } from './form/CreateOfficeForm'
export { UpdateOfficeForm } from './form/UpdateOfficeForm'
export { CreatePositionForm } from './form/CreatePositionForm'
export { CreatePersonnelForm } from './form/CreatePersonnelForm'
export { UpdatePositionForm } from './form/UpdatePositionForm'
export { UpdatePersonnelForm } from './form/UpdatePersonnelForm'

// Handlers (API request handlers)
export {
  getOrgUnitsRequest,
  getOrgUnitRequest,
  createOrgUnitRequest,
  updateOrgUnitRequest,
  deleteOrgUnitRequest,
  getPositionsRequest,
  createPositionRequest,
  updatePositionRequest,
  deletePositionRequest,
  getPersonnelRequest,
  createPersonnelRequest,
  updatePersonnelRequest,
  deletePersonnelRequest,
} from './handlers'

// Table utilities
export {
  OrgUnitActions,
  createOrgUnitColumns,
  OrgUnitToolbar,
  PositionActions,
  createPositionColumns,
  PositionToolbar,
  PersonnelActions,
  createPersonnelColumns,
  PersonnelToolbar,
  type OrgUnit,
  type Position,
  type Personnel,
} from './table'

// Components
export { default as ReportingChainFilter } from './components/ReportingChainFilter'
