import type { NavigationGroup } from '@/components/UnifiedAppSidebar'

export const navigationGroup: Array<NavigationGroup> = [
  {
    title: 'Planning',
    url: '/v1/planning',
    items: [
      {
        title: 'Dashboard Overview',
        url: '/v2/dashboard',
        icon: 'LayoutDashboard',
      },
      {
        title: 'Overview',
        url: '/v1/planning',
        icon: 'HomeIcon',
      },
      {
        title: 'Office',
        url: '/v1/planning/office',
        icon: 'Building',
      },
      {
        title: 'KPI',
        url: '/v1/planning/kpi',
        icon: 'Target',
      },
      {
        title: 'OPCR',
        url: '/v1/planning/opcr',
        icon: 'FileText',
      },
      {
        title: 'WFP',
        url: '/v1/planning/wfp-expenditure',
        icon: 'FolderOpen',
      },
      {
        title: 'Evaluation',
        url: '/v1/planning/evaluation',
        icon: 'ClipboardCheck',
      },
      {
        title: 'Settings',
        url: '/v1/planning/settings',
        icon: 'Settings',
      },
      {
        title: 'Procurement Library',
        url: '/v2/procurement-library',
        icon: 'BookOpen',
      },
      {
        title: 'Market Scoping',
        url: '/v2/market-scoping',
        icon: 'Search',
      },
    ],
  },
  {
    title: 'UACS Library',
    url: '/v2/uacs-library',
    items: [
      {
        title: 'Overview',
        url: '/v2/uacs-library',
        icon: 'HomeIcon',
      },
      {
        title: 'Code Segments',
        icon: 'Code',
      },
      {
        title: 'Rules',
        icon: 'Shield',
      },
      {
        title: 'Data Management',
        icon: 'Database',
      },
    ],
  },
  {
    title: 'Finance',
    url: '/v1/finance/overview',
    items: [
      {
        title: 'Overview',
        url: '/v1/finance/overview',
        icon: 'HomeIcon',
      },
      {
        title: 'Fund Monitoring',
        url: '/v1/finance/fund-monitoring',
        icon: 'TrendingUp',
      },
      {
        title: 'Fund',
        url: '/v1/finance/fund-source',
        icon: 'Database',
      },
    ],
  },
  {
    title: 'Delivery Unit',
    items: [
      {
        title: 'Overview',
        icon: 'HomeIcon',
      },
      {
        title: 'OPCR',
        icon: 'FileText',
      },
      {
        title: 'WFP',
        icon: 'FolderOpen',
      },
    ],
  },
  {
    title: 'System Administration',
    items: [
      {
        title: 'Market Scoping',
        url: '/v2/market-scoping/settings',
        icon: 'Search',
      },
      {
        title: 'Bidding Document Library',
        url: '/v2/bidding-document-library',
        icon: 'BookOpen',
      },
      {
        title: 'Fiscal Year & Policies',
        url: '/v2/fiscal-year-and-policies',
        icon: 'Calendar',
      },
      {
        title: 'Organization Structure',
        url: '/v2/organization',
        icon: 'Building',
      },
      {
        title: 'UACS Library',
        url: '/v2/uacs-library',
        icon: 'Book',
      },
      {
        title: 'Procurement Library',
        url: '/v2/procurement-library',
        icon: 'BookOpen',
      },
    ],
  },
  {
    title: 'BAC',
    url: '/v2/bac',
    items: [
      {
        title: 'BAC Overview',
        url: '/v2/bac',
        icon: 'Shield',
      },
    ],
  },
]
