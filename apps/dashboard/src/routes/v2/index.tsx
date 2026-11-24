/**
 * V2 Dashboard Index Page
 * Redirects to /v2/dashboard
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/v2/')({
  beforeLoad: () => {
    throw redirect({
      to: '/v2/dashboard',
    });
  },
  component: () => null,
});
