/**
 * Mock Session Handler for Development
 * 
 * This file configures mock authentication for development.
 * In production, this would be replaced with real NextAuth configuration.
 */

export const mockSession = {
  user: {
    id: 'user-123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Planning Officer',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}
