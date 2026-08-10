/**
 * Organizational Structure Request Handlers
 *
 * This module provides type-safe API request handlers for all CRUD operations
 * on organizational structure entities (OrgUnits, Positions, Personnel).
 *
 * All handlers follow the QueryBlueprintFromTemplate pattern from erpez-shared-lib
 * for consistent API integration with TanStack Query.
 */

// Org Unit Handlers
export { getOrgUnitsRequest } from './getOrgUnitsRequest'
export { getOrgUnitRequest } from './getOrgUnitRequest'
export { createOrgUnitRequest } from './createOrgUnitRequest'
export { updateOrgUnitRequest } from './updateOrgUnitRequest'
export { deleteOrgUnitRequest } from './deleteOrgUnitRequest'

// Position Handlers
export { getPositionsRequest } from './getPositionsRequest'
export { createPositionRequest } from './createPositionRequest'
export { updatePositionRequest } from './updatePositionRequest'
export { deletePositionRequest } from './deletePositionRequest'

// Personnel Handlers
export { getPersonnelRequest } from './getPersonnelRequest'
export { createPersonnelRequest } from './createPersonnelRequest'
export { updatePersonnelRequest } from './updatePersonnelRequest'
export { deletePersonnelRequest } from './deletePersonnelRequest'
