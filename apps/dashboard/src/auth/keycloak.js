import Keycloak from 'keycloak-js'

// Configure the Keycloak instance
// IMPORTANT: url should be the BASE Keycloak server URL (without /realms/xxx)
// The Keycloak library will automatically append /realms/{realm} to it
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  audience: import.meta.env.VITE_KEYCLOAK_AUDIENCE,
}

// Create and export the Keycloak instance
const keycloak = new Keycloak(keycloakConfig)

export default keycloak
