// OrgUnit table components
export { default as OrgUnitActions } from './OrgUnitActions'
export { createOrgUnitColumns } from './OrgUnitColumns'
export { default as OrgUnitToolbar } from './OrgUnitToolbar'

// Position table components
export { default as PositionActions } from './PositionActions'
export { createPositionColumns } from './PositionColumns'
export { default as PositionToolbar } from './PositionToolbar'

// Settings table components (TemplateTable pattern)
// Re-export both column factories and pre-built column sets so callers can
// import `createXColumns` OR `XColumn` from the same module.
export {
  createOfficeTypeColumns,
  createPositionTypeColumns,
  createSalaryGradeColumns,
  createPlantillaTypeColumns,
  createPMTMaximumSeatsColumns,
  OfficeTypeColumn,
  PositionTypeColumn,
  SalaryGradeColumn,
  PlantillaTypeColumn,
  PMTMaximumSeatsColumn,
} from './Column'
export { default as Toolbar } from './Toolbar'
export { Actions } from './Actions'

// Personnel table components
export { default as PersonnelActions } from './PersonnelActions'
export { createPersonnelColumns } from './PersonnelColumns'
export { default as PersonnelToolbar } from './PersonnelToolbar'

// Types
export type { OrgUnit, Position, Personnel } from './types'
