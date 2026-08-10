/**
 * V2 Dashboard Index Page
 * Home/Overview page for V2 dashboard with Dashtail styling
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/v2/')({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div>
      <h1>V2 Dashboard</h1>
    </div>
  );
}
