/**
 * Backward compatibility alias: KeycloakProvider is replaced by ClerkAuthProvider.
 * Keycloak is exclusively used by the Dashboard application.
 */
export * from './ClerkAuthProvider';
export { ClerkAuthProvider as default } from './ClerkAuthProvider';
