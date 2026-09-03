import Keycloak from 'keycloak-js';

// Configure the Keycloak instance
// url should be the BASE Keycloak server URL (without /realms/xxx)
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.dev.nextstep-software.com',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'erpez',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web-client',
};

// Create and export the Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
