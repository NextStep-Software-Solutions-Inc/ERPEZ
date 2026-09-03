import {
  Application,
  BarLeft,
  BarTop,
  Book,
  Building2,
  Calendar,
  Cart,
  Chart,
  ChartArea,
  ChartBar,
  ClipBoard,
  ClipBoard2,
  Components,
  CustomIcon,
  DashBoard,
  Diamond,
  Envelope,
  Error,
  Files,
  Flag,
  Graph,
  Grid,
  Heroicon,
  Icons,
  ListFill,
  LucideIcon,
  Mail,
  Map,
  Map2,
  Messages,
  Monitor,
  Note,
  Note2,
  Note3,
  Pointer,
  PretentionChartLine,
  PretentionChartLine2,
  Sheild,
  Stacks2,
} from '@/components/svg'

export interface MenuItemProps {
  title: string
  icon: any
  href?: string
  child?: Array<MenuItemProps>
  megaMenu?: Array<MenuItemProps>
  multi_menu?: Array<MenuItemProps>
  nested?: Array<MenuItemProps>
  onClick: () => void
}

export const menusConfig = {
  mainNav: [
    {
      title: 'Dashboard',
      icon: DashBoard,
      child: [
        {
          title: 'Analytics',
          href: '/dashboard',
          icon: Graph,
        },
        {
          title: 'Ecommerce',
          href: '/ecommerce',
          icon: Cart,
        },
        {
          title: 'Project ',
          href: '/project',
          icon: ClipBoard,
        },
      ],
    },
    {
      title: 'Application',
      icon: Application,
      child: [
        {
          title: 'chat',
          icon: Messages,
          href: '/chat',
        },
        {
          title: 'email',
          icon: Envelope,
          href: '/email',
        },
        {
          title: 'kanban',
          icon: Monitor,
          href: '/kanban',
        },
        {
          title: 'task',
          icon: ListFill,
          href: '/task',
        },
        {
          title: 'calendar',
          icon: Calendar,
          href: '/calendar',
        },

        {
          title: 'project',
          icon: ClipBoard,
          href: '/projects',
        },
      ],
    },
    {
      title: 'Components',
      icon: Components,
      megaMenu: [
        {
          title: 'Base Ui',
          icon: Flag,
          child: [
            {
              title: 'accordion',
              icon: 'heroicons:information-circle',
              href: '/accordion',
            },
            {
              title: 'alert',
              icon: 'heroicons:information-circle',
              href: '/alert',
            },
            {
              title: 'avatar',
              icon: 'heroicons:information-circle',
              href: '/avatar',
            },
            {
              title: 'badge',
              icon: 'heroicons:cube',
              href: '/badge',
            },
            {
              title: 'breadcrumb',
              icon: 'heroicons:cube',
              href: '/breadcrumb',
            },
            {
              title: 'Button',
              icon: 'heroicons:cube',
              href: '/button',
            },

            {
              title: 'Card',
              icon: 'heroicons:cube',
              href: '/card',
            },
            {
              title: 'carousel',
              icon: 'heroicons:information-circle',
              href: '/carousel',
            },
            {
              title: 'color',
              icon: 'heroicons:information-circle',
              href: '/color',
            },
            {
              title: 'combobox',
              icon: 'heroicons:cube',
              href: '/combobox',
            },
            {
              title: 'command',
              icon: 'heroicons:cube',
              href: '/command',
            },
            {
              title: 'Dropdown',
              icon: 'heroicons:cube',
              href: '/dropdown',
            },
            {
              title: 'Dialog',
              icon: 'heroicons:cube',
              href: '/dialog',
            },
            {
              title: 'kbd',
              icon: 'heroicons:information-circle',
              href: '/kbd',
            },
            {
              title: 'pagination',
              icon: 'heroicons:cube',
              href: '/pagination',
            },
            {
              title: 'popover',
              icon: 'heroicons:information-circle',
              href: '/popover',
            },
            {
              title: 'progress',
              icon: 'heroicons:information-circle',
              href: '/progress',
            },
            {
              title: 'sheet',
              icon: 'heroicons:cube',
              href: '/sheet',
            },
            {
              title: 'skeleton',
              icon: 'heroicons:cube',
              href: '/skeleton',
            },
            {
              title: 'tabs',
              icon: 'heroicons:cube',
              href: '/tabs',
            },
            {
              title: 'toast',
              icon: 'heroicons:information-circle',
              href: '/toast',
            },
            {
              title: 'tooltip',
              icon: 'heroicons:information-circle',
              href: '/tooltip',
            },
            {
              title: 'typography',
              icon: 'heroicons:information-circle',
              href: '/typography',
            },
          ],
        },
        {
          title: 'Advanced Ui',
          icon: Book,
          child: [
            {
              title: 'affix',
              icon: 'heroicons:cube',
              href: '/affix',
            },
            {
              title: 'calendar',
              icon: 'heroicons:information-circle',
              href: '/calendar-page',
            },
            {
              title: 'steps',
              icon: 'heroicons:information-circle',
              href: '/steps',
            },
            {
              title: 'timeline',
              icon: 'heroicons:cube',
              href: '/timeline',
            },
            {
              title: 'tour',
              icon: 'heroicons:cube',
              href: '/tour',
            },
            {
              title: 'tree',
              icon: 'heroicons:information-circle',
              href: '/tree',
            },
            {
              title: 'watermark',
              icon: 'heroicons:cube',
              href: '/watermark',
            },
          ],
        },
      ],
    },

    {
      title: 'Forms',
      icon: Stacks2,
      megaMenu: [
        {
          title: 'Form Elements',
          icon: Note,
          child: [
            {
              title: 'checkbox',
              href: '/checkbox',
            },
            {
              title: 'file uploader',
              href: '/file-uploader',
            },
            {
              title: 'input',
              href: '/input',
            },
            {
              title: 'input-group',
              href: '/input2',
            },
            {
              title: 'input-mask',
              href: '/input-mask',
            },
            {
              title: 'radio',
              href: '/radio',
            },
            {
              title: 'Range Slider',
              href: '/slider',
            },
            {
              title: 'rating',
              href: '/rating',
            },
            {
              title: 'Select',
              href: '/form-select',
            },
            {
              title: 'React Select',
              href: '/react-select',
            },
            {
              title: 'switch',
              href: '/switch',
            },
            {
              title: 'textarea',
              href: '/textarea',
            },
            {
              title: 'Form Wizard',
              href: '/form-wizard',
            },
            {
              title: 'Form Layout',
              href: '/form-layout',
            },
            {
              title: 'Use Controller',
              href: '/validation-controller',
            },
            {
              title: 'Use Form',
              href: '/validation-useform',
            },
          ],
        },
      ],
    },
    {
      title: 'Pages',
      icon: Files,
      megaMenu: [
        {
          title: 'Authentication',
          icon: Sheild,
          child: [
            {
              title: 'Sign In 01',
              href: '/auth/login',
            },
            {
              title: 'Sign In 02',
              href: '/auth/login2',
            },
            {
              title: 'Sign In 03',
              href: '/auth/login3',
            },
            {
              title: 'Sign In 04',
              href: '/auth/login4',
            },
            {
              title: 'Sign In 05',
              href: '/auth/login5',
            },
            {
              title: 'Sign Up 01',
              href: '/auth/register',
            },
            {
              title: 'Sign Up 02',
              href: '/auth/register2',
            },
            {
              title: 'Sign Up 03',
              href: '/auth/register3',
            },
            {
              title: 'Sign Up 04',
              href: '/auth/register4',
            },
            {
              title: 'Sign Up 05',
              href: '/auth/register5',
            },
            {
              title: 'Forget Password 01',
              href: '/auth/forgot',
            },
            {
              title: 'Forget Password 02',
              href: '/auth/forgot2',
            },
            {
              title: 'Forget Password 03',
              href: '/auth/forgot3',
            },
            {
              title: 'Forget Password 04',
              href: '/auth/forgot4',
            },
            {
              title: 'Forget Password 05',
              href: '/auth/forgot5',
            },
            {
              title: 'Lock Screen 01',
              href: '/auth/lock',
            },
            {
              title: 'Lock Screen 02',
              href: '/auth/lock2',
            },
            {
              title: 'Lock Screen 03',
              href: '/auth/lock3',
            },
            {
              title: 'Lock Screen 04',
              href: '/auth/lock4',
            },
            {
              title: 'Lock Screen 05',
              href: '/auth/lock5',
            },
            {
              title: 'Two-Step 01',
              href: '/auth/verify',
            },
            {
              title: 'Two-Step 02',
              href: '/auth/verify2',
            },
            {
              title: 'Two-Step 03',
              href: '/auth/verify3',
            },
            {
              title: 'Two-Step 04',
              href: '/auth/verify4',
            },
            {
              title: 'Two-Step 05',
              href: '/auth/verify5',
            },
            {
              title: 'Password Create 01',
              href: '/auth/create-password',
            },
            {
              title: 'Password Create 02',
              href: '/auth/create-password2',
            },
            {
              title: 'Password Create 03',
              href: '/auth/create-password3',
            },
            {
              title: 'Password Create 04',
              href: '/auth/create-password4',
            },
            {
              title: 'Password Create 05',
              href: '/auth/create-password5',
            },
          ],
        },
        {
          title: 'Error',
          icon: Error,
          child: [
            {
              title: 'Error 401',
              href: '/error-page/401',
            },
            {
              title: 'Error 403',
              href: '/error-page/403',
            },
            {
              title: 'Error 404',
              href: '/error-page/404',
            },
            {
              title: 'Error 419',
              href: '/error-page/419',
            },
            {
              title: 'Error 429',
              href: '/error-page/429',
            },
            {
              title: 'Error 500',
              href: '/error-page/500',
            },
            {
              title: 'Error 503',
              href: '/error-page/503',
            },
          ],
        },
        {
          title: 'Utility',
          icon: Diamond,
          child: [
            {
              title: 'Blank Page',
              href: '/blank',
            },
            {
              title: 'Coming Soon',
              href: '/utility/comming-soon',
            },
            {
              title: 'Under Maintenance',
              href: '/utility/maintinance',
            },
            {
              title: 'create Invoice',
              href: '/create-invoice',
            },
            {
              title: 'iunvoice-details',
              href: '/invoice-details',
            },
            {
              title: 'iunvoice-list',
              href: '/invoice-list',
            },
          ],
        },
        {
          title: 'Email Template',
          icon: Mail,
          child: [
            {
              title: 'Advanced',
              href: '/reactemail-welcome-advanced',
            },
            {
              title: 'Basic',
              href: '/reactemail-basic-welcome',
            },

            {
              title: 'Reset Password 1',
              href: '/react-email/auth/reset-password-1',
            },
            {
              title: 'Reset Password 2',
              href: '/react-email/auth/reset-password-2',
            },
            {
              title: 'Verify Email',
              href: '/react-email/auth/verify-email',
            },
            {
              title: 'Verify Otp',
              href: '/react-email/auth/verify-otp',
            },

            {
              title: 'Shop',
              href: '/react-email/ecommerce/shop',
            },
            {
              title: 'Shopping Cart',
              href: '/react-email/ecommerce/shopping-cart',
            },
            {
              title: 'Corporate',
              href: '/react-email/corporate',
            },
            {
              title: 'Agency',
              href: '/react-email/agency',
            },
            {
              title: 'Blog',
              href: '/react-email/blog',
            },
            {
              title: 'Photography',
              href: '/react-email/photography',
            },
          ],
        },
      ],
    },
    {
      title: 'Tables',
      icon: Grid,
      child: [
        {
          title: 'Simple Table',
          href: '/simple-table',
          icon: BarLeft,
        },
        {
          title: 'tailwindui table',
          href: '/tailwindui-table',
          icon: BarLeft,
        },
        {
          title: 'Data Table',
          href: '/data-table',
          icon: BarTop,
        },
      ],
    },
    {
      title: 'Diagram',
      icon: Chart,
      child: [
        {
          title: 'Overview',
          href: '/diagram/reactflow/overview',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Organization Tree',
          href: '/diagram/reactflow/organization-tree',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Update Node',
          href: '/diagram/reactflow/updating',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Add Node',
          href: '/diagram/reactflow/add-node',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Horizontal Flow',
          href: '/diagram/reactflow/horizontal-flow',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Dagree Tree',
          href: '/diagram/reactflow/dagree-tree',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Download Diagram',
          href: '/diagram/reactflow/download-diagram',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'With Minimap',
          href: '/diagram/reactflow/with-minimap',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'With Background',
          href: '/diagram/reactflow/with-background',
          icon: 'heroicons:information-circle',
        },
        {
          title: 'Panel Position',
          href: '/diagram/reactflow/panel-position',
          icon: 'heroicons:information-circle',
        },
      ],
    },
    {
      title: 'Chart',
      icon: ChartArea,
      megaMenu: [
        {
          title: 'Apex Chart',
          icon: ChartBar,
          child: [
            {
              title: 'Line',
              href: '/charts-appex-line',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Area',
              href: '/charts-appex-area',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Column',
              href: '/charts-appex-column',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Bar',
              href: '/charts-appex-bar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Combo/Mixed',
              href: '/charts-appex-combo',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Range Area',
              href: '/charts-appex-range',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Timeline',
              href: '/charts-appex-timeline',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Funnel',
              href: '/charts-appex-funnel',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Candle Stick',
              href: '/charts-appex-candlestick',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Boxplot',
              href: '/charts-appex-boxplot',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Pie',
              href: '/charts-appex-pie',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Radar',
              href: '/charts-appex-radar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Polar Area',
              href: '/charts-appex-polararea',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Radial Bars',
              href: '/charts-appex-radialbars',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Bubble',
              href: '/charts-appex-bubble',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scatter',
              href: '/charts-appex-scatter',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Heatmap',
              href: '/charts-appex-heatmap',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Treemap',
              href: '/charts-appex-treemap',
              icon: 'heroicons:information-circle',
            },
          ],
        },
        {
          title: 'Re Chart',
          icon: PretentionChartLine,
          child: [
            {
              title: 'Line',
              href: '/charts-rechart-line',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Area',
              href: '/charts-rechart-area',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Bar',
              href: '/charts-rechart-bar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scatter',
              href: '/charts-rechart-scatter',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Composed',
              href: '/charts-rechart-composed',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Pie',
              href: '/charts-rechart-pie',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Radar',
              href: '/charts-rechart-radar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Radial Bar',
              href: '/charts-rechart-radialbar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Tree Map',
              href: '/charts-rechart-treemap',
              icon: 'heroicons:information-circle',
            },
          ],
        },
        {
          title: 'chart js',
          icon: PretentionChartLine2,
          child: [
            {
              title: 'Bar',
              href: '/charts-chartjs-bar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Line',
              href: '/charts-chartjs-line',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Area',
              href: '/charts-chartjs-area',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Other',
              href: '/charts-chartjs-other',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scales',
              href: '/charts-chartjs-scales',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scale Options',
              href: '/charts-chartjs-scaleoptions',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Legend',
              href: '/charts-chartjs-legend',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Title',
              href: '/charts-chartjs-title',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Tooltip',
              href: '/charts-chartjs-tooltip',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scriptable Options',
              href: '/charts-chartjs-scriptable',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Animations',
              href: '/charts-chartjs-animations',
              icon: 'heroicons:information-circle',
            },
          ],
        },
        {
          title: 'unovis',
          icon: PretentionChartLine,
          child: [
            {
              title: 'Line',
              href: '/charts-unovis-line',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Bar',
              href: '/charts-unovis-bar',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Area',
              href: '/charts-unovis-area',
              icon: 'heroicons:information-circle',
            },
            {
              title: 'Scatter',
              href: '/charts-unovis-scatter',
              icon: 'heroicons:information-circle',
            },
          ],
        },
      ],
    },
    {
      title: 'Maps',
      icon: Map,
      child: [
        {
          title: 'Vector',
          icon: Pointer,
          href: '/maps-vector',
        },
        {
          title: 'React Leaflet',
          icon: Map2,
          href: '/map-react-leaflet',
        },

        {
          title: 'Leaflet Map',
          icon: ChartBar,
          href: '/map-unovis-leaflet',
        },
        {
          title: 'Leaflet Flow',
          icon: ChartArea,
          href: '/map-unovis-flow',
        },
        {
          title: 'Leaflet Advance',
          icon: Graph,
          href: '/map-unovis-advance',
        },
      ],
    },
    {
      title: 'Icons',
      icon: Icons,
      child: [
        {
          title: 'Hero Icons',
          icon: Heroicon,
          href: '/icons-iconify',
        },
        {
          title: 'Lucide Icons',
          icon: LucideIcon,
          href: '/icons-lucide',
        },
        {
          title: 'Custom Icons',
          icon: CustomIcon,
          href: '/icons-custom',
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: 'Dashboard Overview',
        icon: DashBoard,
        href: '/v2/dashboard',
      },
      {
        title: 'Strategic Planning',
        icon: ChartBar,
        child: [
          {
            title: 'MFO Reference',
            href: '/v2/mfo-reference',
            icon: Book,
          },
          {
            title: 'KPI Library',
            href: '/v2/kpi-library',
            icon: ClipBoard2,
          },
          {
            title: 'Annual Performance Planning',
            href: '/v2/annual-performance-planning',
            icon: ChartArea,
          },
        ],
      },
      {
        title: 'Performance Management',
        icon: Graph,
        child: [
          {
            title: 'Commitments (OPCR)',
            href: '/v2/commitments',
            icon: ClipBoard,
          },
          {
            title: 'Work and Financial Plan',
            href: '/v2/wfp',
            icon: Files,
          },
        ],
      },
      {
        title: 'Budget & Operations',
        icon: Cart,
        child: [
          {
            title: 'Line-Item Budgeting',
            href: '/v2/line-item-budgeting',
            icon: Note3,
          },
        ],
      },
      {
        title: 'Procurement Planning',
        icon: ListFill,
        child: [
          {
            title: 'Market Scoping',
            href: '/v2/market-scoping',
            icon: ClipBoard,
          },
          {
            title: 'PPMP',
            href: '/v2/ppmp',
            icon: ClipBoard2,
          },
          {
            title: 'APP Consolidation',
            href: '/v2/app-consolidation',
            icon: Note,
          },
        ],
      },
      {
        title: 'Performance Review',
        icon: Note2,
        href: '/v2/performance-review',
      },
      {
        title: 'Reports',
        icon: Files,
        href: '/v2/reports',
      },
      {
        title: 'Dashboard',
        icon: DashBoard,
        href: '/v2/procurement-dashboard',
      },
      // Supplier Portal — sidebarNav.modern (modern layout variant)
      {
        title: 'Supplier Portal',
        icon: ListFill,
        child: [
          {
            title: 'RFQ Item',
            href: '/v2/supplier-portal/rfq-item',
            icon: Envelope,
          },
          {
            title: 'Direct Contracting Item',
            href: '/v2/supplier-portal/direct-contracting-item',
            icon: Cart,
          },
          {
            title: 'Manage Supplier Portal',
            href: '/v2/manage-supplier-portal',
            icon: Envelope,
          },
        ],
      },
      {
        title: 'Procurement Request',
        icon: Cart,
        child: [
          {
            title: 'Agency Purchase Requests (APR)',
            href: '/v2/agency-purchase-requests-apr',
            icon: ClipBoard2,
          },
          {
            title: 'Purchase Requests (PR)',
            href: '/v2/purchase-requests-pr',
            icon: ClipBoard,
          },
          {
            title: 'Manage PRs',
            href: '/v2/manage-prs',
            icon: Note3,
          },
          {
            title: 'Manage APRs',
            href: '/v2/manage-aprs',
            icon: Note,
          },
        ],
      },
      {
        title: 'Bids and Awards Committee (BAC)',
        icon: Building2,
        child: [
          {
            title: 'BAC Resolutions',
            href: '/v2/bac-resolutions',
            icon: Book,
          },
        ],
      },
      {
        title: 'Direct Acquisition',
        icon: Cart,
        child: [
          {
            title: 'Direct Acquisition Request',
            href: '/v2/direct-acquisition-request',
            icon: Envelope,
          },
          {
            title: 'Manage Direct Acquisition',
            href: '/v2/manage-direct-acquisition',
            icon: Files,
          },
        ],
      },
      {
        title: 'Direct Contracting',
        icon: 'lucide:hand-coins',
        child: [
          {
            title: 'Direct Contracting Request',
            href: '/v2/direct-contracting-request',
          },
          {
            title: 'Manage Direct Contracting',
            href: '/v2/manage-direct-contracting',
          },
          {
            title: 'Manage Supplier Direct Contracting',
            href: '/v2/manage-supplier-direct-contracting',
          },
        ],
      },
      {
        title: 'SVP / Shopping',
        icon: ListFill,
        child: [
          {
            title: 'Request for Quotation (RFQ)',
            href: '/v2/request-for-quotation-rfq',
            icon: Envelope,
          },
          {
            title: 'Manage RFQ',
            href: '/v2/manage-rfq',
            icon: Note,
          },
          {
            title: 'Abstract of Bids (AOB)',
            href: '/v2/abstract-of-bids-aob',
            icon: ChartBar,
          },
          {
            title: 'Manage AOB',
            href: '/v2/manage-aob',
            icon: Files,
          },
        ],
      },
      {
        title: 'Public Bidding',
        icon: Files,
        child: [
          {
            title: 'Master BAC Calendar',
            href: '/v2/bidding-master-calendar',
            icon: Calendar,
          },
          {
            title: 'Bidding Documents',
            href: '/v2/bidding-documents',
            icon: Note3,
          },
          {
            title: 'Bid Evaluation',
            href: '/v2/bid-evaluation',
            icon: Note2,
          },
          {
            title: 'Notice of Award (NOA)',
            href: '/v2/notice-of-award-noa',
            icon: Files,
          },
          {
            title: 'Manage NOA',
            href: '/v2/manage-noa',
            icon: Note2,
          },
        ],
      },
      {
        title: 'Contracts & Ordering',
        icon: ClipBoard,
        child: [
          {
            title: 'PO : SVP',
            href: '/v2/po-svp',
            icon: ClipBoard2,
          },
          {
            title: 'PO: PUBLIC BIDDING',
            href: '/v2/po-public-bidding',
            icon: ClipBoard2,
          },
          {
            title: 'PO: Direct Acquisition',
            href: '/v2/po-direct-acquisition',
            icon: ClipBoard2,
          },
          {
            title: 'Contracts (For Consulting/Infrastructure)',
            href: '/v2/contracts-consulting-infrastructure',
            icon: Files,
          },
          {
            title: 'Manage Contracts',
            href: '/v2/manage-contracts',
            icon: Note3,
          },
          {
            title: 'Notice to Proceed (NTP)',
            href: '/v2/notice-to-proceed-ntp',
            icon: Calendar,
          },
          {
            title: 'Manage NTP',
            href: '/v2/manage-ntp',
            icon: Note2,
          },
        ],
      },
      {
        title: 'System Administration',
        icon: Sheild,
        child: [
          {
            title: 'Market Scoping',
            href: '/v2/market-scoping/settings',
            icon: ListFill,
          },
          {
            title: 'Bidding Document Library',
            href: '/v2/bidding-document-library',
            icon: ListFill,
          },
          {
            title: 'Fiscal Year & Policies',
            href: '/v2/fiscal-year-and-policies',
            icon: Calendar,
          },
          {
            title: 'Organization Structure',
            href: '/v2/organization',
            icon: Building2,
          },
          {
            title: 'UACS Library',
            href: '/v2/uacs-library',
            icon: Book,
          },
          {
            title: 'Procurement Library',
            href: '/v2/procurement-library',
            icon: ListFill,
          },
        ],
      },
      {
        title: 'BAC',
        icon: Sheild,
        href: '/v2/bac',
      },
    ],
    classic: [
      {
        isHeader: true,
        title: 'Planning',
      },
      {
        title: 'Dashboard Overview',
        icon: DashBoard,
        href: '/v2/dashboard',
      },
      {
        title: 'Strategic Planning',
        icon: ChartBar,
        child: [
          {
            title: 'MFO Reference',
            href: '/v2/mfo-reference',
            icon: Book,
          },
          {
            title: 'KPI Library',
            href: '/v2/kpi-library',
            icon: ClipBoard2,
          },
          {
            title: 'Annual Performance Planning',
            href: '/v2/annual-performance-planning',
            icon: ChartArea,
          },
        ],
      },
      {
        title: 'Performance Management',
        icon: Graph,
        child: [
          {
            title: 'Commitments (OPCR)',
            href: '/v2/commitments',
            icon: ClipBoard,
          },
          {
            title: 'Work and Financial Plan',
            href: '/v2/wfp',
            icon: Files,
          },
        ],
      },
      {
        title: 'Budget & Operations',
        icon: Cart,
        child: [
          {
            title: 'Line-Item Budgeting',
            href: '/v2/line-item-budgeting',
            icon: Note3,
          },
        ],
      },
      {
        title: 'Procurement Planning',
        icon: ListFill,
        child: [
          {
            title: 'Market Scoping',
            href: '/v2/market-scoping',
            icon: ClipBoard,
          },
          {
            title: 'PPMP',
            href: '/v2/ppmp',
            icon: ClipBoard2,
          },
          {
            title: 'APP Consolidation',
            href: '/v2/app-consolidation',
            icon: Note,
          },
        ],
      },
      {
        title: 'Performance Review',
        icon: Note2,
        href: '/v2/performance-review',
      },
      {
        title: 'Reports',
        icon: Files,
        href: '/v2/reports',
      },
      {
        isHeader: true,
        title: 'Procurement',
      },
      {
        title: 'Dashboard',
        icon: DashBoard,
        href: '/v2/procurement-dashboard',
      },
      // Supplier Portal — sidebarNav.classic (classic layout variant)
      {
        title: 'Supplier Portal',
        icon: ListFill,
        child: [
          {
            title: 'RFQ Item',
            href: '/v2/supplier-portal/rfq-item',
            icon: Envelope,
          },
          {
            title: 'Direct Contracting Item',
            href: '/v2/supplier-portal/direct-contracting-item',
            icon: Cart,
          },
          {
            title: 'Manage Supplier Portal',
            href: '/v2/manage-supplier-portal',
            icon: Envelope,
          },
        ],
      },
      {
        title: 'Procurement Request',
        icon: Cart,
        child: [
          {
            title: 'Agency Purchase Requests (APR)',
            href: '/v2/agency-purchase-requests-apr',
            icon: ClipBoard2,
          },
          {
            title: 'Purchase Requests (PR)',
            href: '/v2/purchase-requests-pr',
            icon: ClipBoard,
          },
          {
            title: 'Manage PRs',
            href: '/v2/manage-prs',
            icon: Note3,
          },
          {
            title: 'Consolidate PRs',
            href: '/v2/consolidate-prs',
            icon: Files,
          },
          {
            title: 'Manage APRs',
            href: '/v2/manage-aprs',
            icon: Note,
          },
        ],
      },
      {
        title: 'Bids and Awards Committee (BAC)',
        icon: Building2,
        child: [
          {
            title: 'BAC Resolutions',
            href: '/v2/bac-resolutions',
            icon: Book,
          },
        ],
      },
      {
        title: 'Direct Acquisition',
        icon: Cart,
        child: [
          {
            title: 'Direct Acquisition Request',
            href: '/v2/direct-acquisition-request',
            icon: Envelope,
          },
          {
            title: 'Manage Direct Acquisition',
            href: '/v2/manage-direct-acquisition',
            icon: Files,
          },
        ],
      },
      {
        title: 'Direct Contracting',
        icon: Cart,
        child: [
          {
            title: 'Direct Contracting Request',
            href: '/v2/direct-contracting-request',
            icon: Envelope,
          },
          {
            title: 'Manage Direct Contracting',
            href: '/v2/manage-direct-contracting',
            icon: Files,
          },
          {
            title: 'Manage Supplier Direct Contracting',
            href: '/v2/manage-supplier-direct-contracting',
            icon: Files,
          },
        ],
      },
      {
        title: 'SVP / Shopping',
        icon: ListFill,
        child: [
          {
            title: 'Request for Quotation (RFQ)',
            href: '/v2/request-for-quotation-rfq',
            icon: Envelope,
          },
          {
            title: 'Manage RFQ',
            href: '/v2/manage-rfq',
            icon: Note,
          },
          {
            title: 'Abstract of Bids (AOB)',
            href: '/v2/abstract-of-bids-aob',
            icon: ChartBar,
          },
          {
            title: 'Manage AOB',
            href: '/v2/manage-aob',
            icon: Files,
          },
        ],
      },
      {
        title: 'Public Bidding',
        icon: Files,
        child: [
          {
            title: 'Master BAC Calendar',
            href: '/v2/bidding-master-calendar',
            icon: Calendar,
          },
          {
            title: 'Bidding Documents',
            href: '/v2/bidding-documents',
            icon: Note3,
          },
          {
            title: 'Bid Evaluation',
            href: '/v2/bid-evaluation',
            icon: Note2,
          },
          {
            title: 'Notice of Award (NOA)',
            href: '/v2/notice-of-award-noa',
            icon: Files,
          },
          {
            title: 'Manage NOA',
            href: '/v2/manage-noa',
            icon: Note2,
          },
        ],
      },
      {
        title: 'Contracts & Ordering',
        icon: ClipBoard,
        child: [
          {
            title: 'PO : SVP',
            href: '/v2/po-svp',
            icon: ClipBoard2,
          },
          {
            title: 'PO: PUBLIC BIDDING',
            href: '/v2/po-public-bidding',
            icon: ClipBoard2,
          },
          {
            title: 'PO: Direct Acquisition',
            href: '/v2/po-direct-acquisition',
            icon: ClipBoard2,
          },
          {
            title: 'Contracts (For Consulting/Infrastructure)',
            href: '/v2/contracts-consulting-infrastructure',
            icon: Files,
          },
          {
            title: 'Manage Contracts',
            href: '/v2/manage-contracts',
            icon: Note3,
          },
          {
            title: 'Notice to Proceed (NTP)',
            href: '/v2/notice-to-proceed-ntp',
            icon: Calendar,
          },
          {
            title: 'Manage NTP',
            href: '/v2/manage-ntp',
            icon: Note2,
          },
        ],
      },
      {
        isHeader: true,
        title: 'Administration',
      },
      {
        title: 'System Administration',
        icon: Sheild,
        child: [
          {
            title: 'Fiscal Year & Policies',
            href: '/v2/fiscal-year-and-policies',
            icon: Calendar,
          },
          {
            title: 'Organization Structure',
            href: '/v2/organization',
            icon: Building2,
          },
          {
            title: 'UACS Library',
            href: '/v2/uacs-library',
            icon: Book,
          },
          {
            title: 'Procurement Library',
            href: '/v2/procurement-library',
            icon: ListFill,
          },
          {
            title: 'Market Scoping',
            href: '/v2/market-scoping/settings',
            icon: ListFill,
          },
          {
            title: 'Bidding Document Library',
            href: '/v2/bidding-document-library',
            icon: ListFill,
          },
        ],
      },
      {
        title: 'BAC',
        icon: Sheild,
        href: '/v2/bac',
      },
    ],
  },
}

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]
