import React, { useState } from "react"
import { Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { Label } from "~/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "~/components/ui/sidebar"

const TENANT_ROUTES = [
  { label: "Overview", path: "/overview", keywords: ["home", "dashboard", "overview"] },
  { label: "Modules", path: "/modules", keywords: ["modules", "ams", "pbms", "pms"] },
  { label: "Billing & Invoices", path: "/billing", keywords: ["billing", "payment", "invoices"] },
  { label: "Subscription", path: "/subscription", keywords: ["subscription", "plan", "tier"] },
  { label: "Plans & Pricing", path: "/plan", keywords: ["upgrade", "plan", "pricing"] },
  { label: "License Management", path: "/license-management", keywords: ["license", "key", "domain"] },
  { label: "Workspace Members", path: "/tenant-member", keywords: ["members", "users", "invite", "team"] },
  { label: "Roles & Permissions", path: "/roles", keywords: ["roles", "permissions", "rbac"] },
]

const SUPER_ADMIN_ROUTES = [
  { label: "Platform Overview", path: "/super-admin/overview", keywords: ["overview", "dashboard", "home"] },
  { label: "Tenant Management", path: "/super-admin/tenant-management", keywords: ["tenants", "workspaces", "organizations"] },
  { label: "User Directory", path: "/super-admin/users", keywords: ["users", "members", "directory"] },
  { label: "Platform Roles", path: "/super-admin/roles", keywords: ["roles", "permissions"] },
  { label: "Quote Inquiries", path: "/super-admin/inquiries", keywords: ["inquiries", "quotes", "leads", "sales"] },
  { label: "Platform Settings", path: "/super-admin/settings", keywords: ["settings", "profile", "account"] },
]

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isSuperAdminPortal = location.pathname.startsWith("/super-admin")
  const routes = isSuperAdminPortal ? SUPER_ADMIN_ROUTES : TENANT_ROUTES

  const matches = query.trim()
    ? routes.filter(
        (r) =>
          r.label.toLowerCase().includes(query.trim().toLowerCase()) ||
          r.keywords.some((k) => k.includes(query.trim().toLowerCase()))
      )
    : []

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (matches.length > 0) {
      navigate(matches[0].path)
      setQuery("")
      setOpen(false)
    }
  }

  return (
    <form {...props} onSubmit={handleSubmit} className="relative">
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Quick Jump
          </Label>
          <SidebarInput
            id="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Go to page..."
            className="pl-8"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
      {open && matches.length > 0 && (
        <div className="absolute left-2 right-2 top-full mt-1 z-50 rounded-md border bg-white shadow-md py-1 text-xs">
          {matches.map((item) => (
            <button
              key={item.path}
              type="button"
              onMouseDown={() => {
                navigate(item.path)
                setQuery("")
                setOpen(false)
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-slate-700"
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">{item.path}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
