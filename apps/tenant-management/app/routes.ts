import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/auth/sign-in.tsx"),
  route("auth/sign-in", "routes/auth/redirect-sign-in.tsx"),
  route("sign-up", "routes/auth/sign-up.tsx"),
  route("auth/sign-up", "routes/auth/redirect-sign-up.tsx"),
  route("sign-up/verify-email-address", "routes/auth/verify-email-address.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("accept-invitation", "routes/protected/accept-invitation.tsx"),

  layout("components/layout/ProtectedLayout.tsx", [
    layout("components/layout/TenantProviderLayout.tsx", [
      layout("components/layout/RoleLayout.tsx", [
        layout("components/layout/TenantLayout.tsx", [
          route("overview", "routes/protected/overview.tsx"),
          route("module", "routes/protected/module.tsx"),
          route("billing", "routes/protected/billing.tsx"),
          route("invoice", "routes/protected/invoice.tsx"),
          route("subscription", "routes/protected/subscription.tsx"),
          route("license-management", "routes/protected/license-management.tsx"),
          route("package-download", "routes/protected/package-download.tsx"),
          route("tenant-member", "routes/protected/tenant-member.tsx"),
        ]),
        route("roles", "routes/protected/roles.tsx"),
        route("register-tenant", "routes/protected/register-tenant.tsx"),
        route("plan", "routes/protected/plan.tsx"),

        layout("components/layout/SuperAdminLayout.tsx", [
          route("super-admin", "routes/super-admin/redirect.tsx"),
          route("super-admin/overview", "routes/super-admin/overview.tsx"),
          route(
            "super-admin/tenant-management",
            "routes/super-admin/tenant-management.tsx"
          ),
          route("super-admin/inquiries", "routes/super-admin/inquiries.tsx"),
          route("super-admin/users", "routes/super-admin/users.tsx"),
          route("super-admin/roles", "routes/super-admin/roles.tsx"),
          route("super-admin/tenant/:id", "routes/protected/tenant/[id].tsx"),
          route("super-admin/settings", "routes/super-admin/settings.tsx"),
        ]),
      ]),
    ]),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;