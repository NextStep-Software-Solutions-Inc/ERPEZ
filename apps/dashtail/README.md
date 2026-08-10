# Dashtail Design System

**Version:** 1.3.0 (TypeScript Full Version)  
**Framework:** Next.js 14  
**Purpose:** Official design system and component library for ERPEZ projects

## Overview

Dashtail is the **primary source of truth** for all UI components, layouts, and styling patterns used across ERPEZ applications. This project serves as a **reference design system** that other applications (erpez, tenant-management) adapt to their specific frameworks.

## 🎨 What's Inside

### Components Structure

```
components/
  ├── partials/           # Composite components
  │   ├── sidebar/        # Sidebar variants (classic, module, popover)
  │   ├── header/         # Header components and layouts
  │   ├── footer/         # Footer components
  │   └── customizer/     # Theme customization
  └── ui/                 # Atomic UI primitives (Button, Input, Card, etc.)
```

### Key Features

- **Multiple Layout Patterns**: Vertical, horizontal, and semi-box layouts
- **Sidebar Variants**: Classic (fixed left), Module (icon-based), Popover (overlay)
- **Theme System**: HSL-based color scale with semantic naming
- **State Management**: Zustand stores for sidebar, theme, and layout state
- **TypeScript**: Full type safety across all components
- **Dark Mode**: Built-in theme switching support

## 🚀 Running Dashtail (Optional)

This project can run standalone for design system development:

```bash
cd dashtail
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the design system.

## 📖 Usage in ERPEZ Applications

**Important:** Do not modify Dashtail files directly. Instead, copy and adapt components to your application.

### Component Adaptation

When using Dashtail components in TanStack Router apps (erpez, tenant-management):

| Dashtail (Next.js) | Target App (TanStack Router) |
|-------------------|------------------------------|
| `"use client"` | Not needed (all client-side) |
| `usePathname()` | `useLocation()` |
| `useRouter()` | `useNavigate()` |
| `<Link href="">` | `<Link to="">` |
| SCSS files | Tailwind CSS (adapt or convert) |

### Example Usage

1. **Find the component** in `dashtail/components/`
2. **Copy the structure and logic** to your app
3. **Adapt routing/navigation** to TanStack Router
4. **Adjust styling** if needed (Tailwind classes remain mostly the same)

## 🎨 Design Tokens

### Color System

```typescript
// Primary colors (Violet)
--primary-50 to --primary-950

// Neutral grays
--default-50 to --default-950

// Semantic colors
--success, --warning, --error, --info
```

### Layout Variables

```typescript
--sidebar-width: 248px
--sidebar-collapsed-width: 72px
--header-height: 64px
```

## 📚 Documentation

For detailed design system guidelines, component patterns, and best practices, see:
- [ERPEZ Copilot Instructions](../.github/copilot-instructions.md)
- [Component Documentation](./components/README.md) *(if available)*

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Note:** This is the Dashtail v1.3.0 TypeScript Full Version template. It is maintained as a reference design system for the ERPEZ project family.
