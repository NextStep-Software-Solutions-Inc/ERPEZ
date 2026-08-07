// Runtime toggle to control using mock BAC resolution handlers.
// Mocks are permitted only in non-production builds to avoid accidental
// usage in production environments.
export const USE_MOCK_BAC_RESOLUTIONS: boolean =
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_USE_MOCK_BAC_RESOLUTIONS !== 'false'
