/**
 * AOB Feature Index
 * Central export point for the entire AOB feature
 *
 * @see documentations/aob-feature-overview.md for comprehensive feature documentation
 * including architecture, data flows, and integration patterns.
 */

// Types
export * from './types'

// Request Handlers
export * from './handlers'

// Atoms (State Management)
export * from './atoms'

// Utilities
export * from './utils'

// Note: Forms, Dialogs, Tables, and Components are exported individually
// to allow lazy loading and code splitting optimization
