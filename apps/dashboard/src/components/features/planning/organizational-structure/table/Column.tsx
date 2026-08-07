/**
 * Central export hub for organizational structure column definitions
 * Individual column definitions are now in separate files for maintainability
 * Max 200 lines per file as per ERPEZ Frontend guidelines
 * 
 * Reference: documentations/feature-structure-pattern.md
 */
export { createOfficeTypeColumns, OfficeTypeColumn } from './OfficeTypeColumns'
export { createPositionTypeColumns, PositionTypeColumn } from './PositionTypeColumns'
export { createSalaryGradeColumns, SalaryGradeColumn } from './SalaryGradeColumns'
export { createPlantillaTypeColumns, PlantillaTypeColumn } from './PlantillaTypeColumns'
export { createPMTMaximumSeatsColumns, PMTMaximumSeatsColumn } from './PMTMaximumSeatsColumns'
