/**
 * Non-CSE Item Catalog & Custom Item Modal
 * Compliant with RA 12009 (NGPA): Purchase Requests requisition Non-CSE items.
 * Provides live integration with the agency's Non-CSE Master Catalog (/non-cse-items)
 * and custom Non-CSE technical specification entry.
 */

import React, { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Search,
  Plus,
  Package,
  Laptop,
  Check,
  Armchair,
  Stethoscope,
  Wrench,
  Filter,
  Loader2,
  Boxes,
  FilePlus,
  ChevronsUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import type { PRItem } from '../types'
import { useNonCSEItems } from '@/features/planning/ppmp/catalog/hooks/useNonCSEItemQueries'
import { useProcurementModes } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import { getFundSourcesRequest } from '@/components/features/planning/fund-source/handlers/getFundSourcesRequest'
import { getProcurementCategoriesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementCategoriesRequest'

const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)
const useProcurementCategories = createQueryHookFromTemplate(getProcurementCategoriesRequest)

export interface AddNonCSEItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItems: (items: PRItem[]) => void
  onSubmitItemRequest?: (item: PRItem) => void
}

export interface CatalogDisplayItem {
  id: string
  name: string
  description: string
  category: string
  unitOfMeasure: string
  unitPrice: number
  productCode?: string
  procurementModeName?: string
  isFromApi?: boolean
}

// Fallback curated Non-CSE items (strictly equipment, goods, and services — no CSE office supplies)
export const FALLBACK_NON_CSE_ITEMS: CatalogDisplayItem[] = [
  // IT Equipment & Software
  {
    id: 'non-cse-it-01',
    name: 'All-in-One Desktop Computer (Core i7 / 16GB / 512GB SSD)',
    description: '23.8-inch FHD IPS display, Windows 11 Pro, keyboard & optical mouse',
    category: 'IT Equipment & Software',
    unitOfMeasure: 'unit',
    unitPrice: 58500,
    productCode: '50203010-IT01',
  },
  {
    id: 'non-cse-it-02',
    name: 'High-Performance Business Laptop 14-inch (Core i7 / 32GB)',
    description: 'Ultra-portable executive notebook with military-grade durability & TPM 2.0',
    category: 'IT Equipment & Software',
    unitOfMeasure: 'unit',
    unitPrice: 72000,
    productCode: '50203010-IT02',
  },
  {
    id: 'non-cse-it-03',
    name: 'Network Laser Multifunction Printer (Print/Scan/Copy)',
    description: 'Monochrome network laser printer with duplex printing and auto feeder',
    category: 'IT Equipment & Software',
    unitOfMeasure: 'unit',
    unitPrice: 24800,
    productCode: '50203010-IT03',
  },
  {
    id: 'non-cse-it-04',
    name: 'Uninterruptible Power Supply (UPS) 1000VA / 600W',
    description: 'Surge protection and battery backup with 4 universal outlets and LCD monitor',
    category: 'IT Equipment & Software',
    unitOfMeasure: 'unit',
    unitPrice: 4200,
    productCode: '50203010-IT04',
  },
  {
    id: 'non-cse-it-05',
    name: 'Wireless Ergonomic Mouse & Keyboard Combo',
    description: '2.4GHz wireless connection with nano receiver, silent switches',
    category: 'IT Equipment & Software',
    unitOfMeasure: 'set',
    unitPrice: 1450,
    productCode: '50203010-IT05',
  },

  // Furniture & Fixtures
  {
    id: 'non-cse-fur-01',
    name: 'Ergonomic Mesh High-Back Office Chair',
    description: 'Breathable mesh back, adjustable lumbar support, 3D armrests, gas lift',
    category: 'Furniture & Fixtures',
    unitOfMeasure: 'unit',
    unitPrice: 6800,
    productCode: '50203020-FUR01',
  },
  {
    id: 'non-cse-fur-02',
    name: 'Heavy-Duty 4-Drawer Steel Filing Cabinet',
    description: 'Cold-rolled steel with anti-tilt central locking mechanism, beige finish',
    category: 'Furniture & Fixtures',
    unitOfMeasure: 'unit',
    unitPrice: 12500,
    productCode: '50203020-FUR02',
  },
  {
    id: 'non-cse-fur-03',
    name: 'Modular Office Workstation Desk (120cm x 60cm)',
    description: 'Melamine top with cable grommet and heavy-duty powder-coated steel frame',
    category: 'Furniture & Fixtures',
    unitOfMeasure: 'unit',
    unitPrice: 8500,
    productCode: '50203020-FUR03',
  },
  {
    id: 'non-cse-fur-04',
    name: 'Executive Conference Table (10-Seater, Mahogany Finish)',
    description: 'Conference table with integrated pop-up multimedia cable connectivity boxes',
    category: 'Furniture & Fixtures',
    unitOfMeasure: 'unit',
    unitPrice: 34000,
    productCode: '50203020-FUR04',
  },

  // Medical & Scientific Supplies
  {
    id: 'non-cse-med-01',
    name: 'Non-Contact Infrared Digital Forehead Thermometer',
    description: 'Medical-grade high accuracy sensor with audible fever alert and LCD screen',
    category: 'Medical & Scientific Supplies',
    unitOfMeasure: 'unit',
    unitPrice: 1200,
    productCode: '50203080-MED01',
  },
  {
    id: 'non-cse-med-02',
    name: 'First Aid Emergency Response Kit (Institutional Bag)',
    description: 'Complete emergency medical response supplies in heavy-duty water-resistant bag',
    category: 'Medical & Scientific Supplies',
    unitOfMeasure: 'kit',
    unitPrice: 3800,
    productCode: '50203080-MED02',
  },
  {
    id: 'non-cse-med-03',
    name: 'Digital Automatic Upper Arm Blood Pressure Monitor',
    description: 'Clinical accuracy monitor with irregular heartbeat detector and dual cuff',
    category: 'Medical & Scientific Supplies',
    unitOfMeasure: 'unit',
    unitPrice: 2650,
    productCode: '50203080-MED03',
  },

  // Janitorial & Facility Maintenance
  {
    id: 'non-cse-jan-01',
    name: 'Industrial Heavy-Duty Wet & Dry Vacuum Cleaner (30L)',
    description: 'High-power 1400W motor with complete stainless steel tank and accessories',
    category: 'Janitorial & Facility Maintenance',
    unitOfMeasure: 'unit',
    unitPrice: 9500,
    productCode: '50203990-JAN01',
  },
  {
    id: 'non-cse-jan-02',
    name: 'Commercial High-Pressure Washer 1800W',
    description: 'Heavy-duty pressure cleaner for building exterior, parking, and facility maintenance',
    category: 'Janitorial & Facility Maintenance',
    unitOfMeasure: 'unit',
    unitPrice: 8200,
    productCode: '50203990-JAN02',
  },

  // Professional & Technical Services
  {
    id: 'non-cse-srv-01',
    name: 'ICT Equipment Preventive Maintenance (Annual Contract)',
    description: 'Comprehensive quarterly preventive maintenance and inspection for office IT equipment',
    category: 'Professional & Technical Services',
    unitOfMeasure: 'lot',
    unitPrice: 45000,
    productCode: '50212990-SRV01',
  },
  {
    id: 'non-cse-srv-02',
    name: 'HVAC Air-Conditioning Quarterly Cleaning & Servicing',
    description: 'Full chemical wash, pressure test, and filter servicing for building AC units',
    category: 'Professional & Technical Services',
    unitOfMeasure: 'lot',
    unitPrice: 28000,
    productCode: '50212990-SRV02',
  },
]

const NON_CSE_CATEGORIES = [
  'All',
  'IT Equipment & Software',
  'Furniture & Fixtures',
  'Medical & Scientific Supplies',
  'Janitorial & Facility Maintenance',
  'Professional & Technical Services',
]

export const FALLBACK_PROCUREMENT_MODES = [
  'Direct Acquisition',
  'Small Value Procurement',
  'Competitive Bidding',
  'Direct Contracting',
  'Negotiated Procurement',
]

const FALLBACK_FUND_SOURCES = [
  'General Fund',
  'Special Education Fund',
  'Trust Fund',
  'Internally Generated Funds',
]

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getItemIcon(category: string) {
  const cat = (category || '').toLowerCase()
  if (cat.includes('it') || cat.includes('computer') || cat.includes('software')) return Laptop
  if (cat.includes('furniture') || cat.includes('fixture') || cat.includes('chair') || cat.includes('desk'))
    return Armchair
  if (cat.includes('medical') || cat.includes('scientific') || cat.includes('health')) return Stethoscope
  if (cat.includes('service') || cat.includes('maintenance') || cat.includes('technical')) return Wrench
  return Package
}

export function AddNonCSEItemModal({
  open,
  onOpenChange,
  onAddItems,
  onSubmitItemRequest,
}: AddNonCSEItemModalProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Catalog selections: itemId -> quantity (allow empty string so it does not default to 1)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number | ''>>({})

  // Custom item form state (default quantity to empty string so it does not default to 1)
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customCategory, setCustomCategory] = useState('IT Equipment & Software')
  const [customUom, setCustomUom] = useState('unit')
  const [customQty, setCustomQty] = useState<number | ''>('')
  const [customPrice, setCustomPrice] = useState<number | ''>('')
  const [customMode, setCustomMode] = useState('')
  const [customFund, setCustomFund] = useState('General Fund')
  const [customMonth, setCustomMonth] = useState('January')
  const [customIsNonCSE, setCustomIsNonCSE] = useState(true)
  const [alsoSubmitAsItemRequest, setAlsoSubmitAsItemRequest] = useState(false)
  const [fundOpen, setFundOpen] = useState(false)

  // Fetch live Procurement Modes from API (/procurement-modes)
  const { data: modesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Fetch live Fund Sources from API (/fund-sources)
  const { data: fundSourcesResponse } = useFundSources({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Fetch live Procurement Categories from API (/procurement-categories)
  const { data: categoriesResponse } = useProcurementCategories({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Live options with graceful Philippine procurement defaults (deduplicated)
  const procurementModeOptions = useMemo<string[]>(() => {
    const rawModes = modesResponse?.data ?? []
    const uniqueNames = Array.from(
      new Set(
        rawModes
          .filter((m) => m.isActive && !m.isArchived && m.name && m.name.trim() !== '')
          .map((m) => (m.name as string).trim())
      )
    )
    if (uniqueNames.length > 0) return uniqueNames
    return FALLBACK_PROCUREMENT_MODES
  }, [modesResponse])

  const fundSourceOptions = useMemo<string[]>(() => {
    const rawFunds = fundSourcesResponse?.data ?? []
    const uniqueNames = Array.from(
      new Set(
        rawFunds
          .filter((f) => f.name && f.name.trim() !== '')
          .map((f) => f.name.trim())
      )
    )
    if (uniqueNames.length > 0) return uniqueNames
    return FALLBACK_FUND_SOURCES
  }, [fundSourcesResponse])

  const categoryOptions = useMemo<string[]>(() => {
    const rawCats = categoriesResponse?.data ?? []
    const uniqueNames = Array.from(
      new Set(
        rawCats
          .filter((c) => c.name && c.name.trim() !== '')
          .map((c) => c.name.trim())
      )
    )
    if (uniqueNames.length > 0) return uniqueNames
    return NON_CSE_CATEGORIES.filter((c) => c !== 'All')
  }, [categoriesResponse])

  // Synchronize defaults with live options
  useEffect(() => {
    if (procurementModeOptions.length > 0 && !procurementModeOptions.includes(customMode)) {
      setCustomMode(procurementModeOptions[0])
    }
  }, [procurementModeOptions, customMode])

  useEffect(() => {
    if (fundSourceOptions.length > 0 && !fundSourceOptions.includes(customFund)) {
      setCustomFund(fundSourceOptions[0])
    }
  }, [fundSourceOptions, customFund])

  useEffect(() => {
    if (categoryOptions.length > 0 && !categoryOptions.includes(customCategory)) {
      setCustomCategory(categoryOptions[0])
    }
  }, [categoryOptions, customCategory])

  // Fetch live Non-CSE items from backend
  const { data: nonCseResponse, isLoading: isCatalogLoading } = useNonCSEItems({
    pageSize: 100,
    page: 1,
  })

  // Format API items into unified catalog format
  const apiCatalogItems = useMemo<CatalogDisplayItem[]>(() => {
    const rawList = nonCseResponse?.data || []
    return rawList.map((item) => ({
      id: item.id,
      name: item.name || 'Untitled Non-CSE Item',
      description: item.description || item.remarks || '',
      category: item.procurementCategoryName || 'Non-CSE Equipment & Goods',
      unitOfMeasure: item.uomName || 'unit',
      unitPrice: item.currentPrice || 0,
      productCode: item.productCode,
      procurementModeName: undefined,
      isFromApi: true,
    }))
  }, [nonCseResponse])

  // Combine API items with curated Non-CSE fallback items
  const allCatalogItems = useMemo<CatalogDisplayItem[]>(() => {
    if (apiCatalogItems.length > 0) {
      return apiCatalogItems
    }
    return FALLBACK_NON_CSE_ITEMS
  }, [apiCatalogItems])

  // Dynamic filter categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    set.add('All')
    for (const item of allCatalogItems) {
      if (item.category) set.add(item.category)
    }
    for (const cat of NON_CSE_CATEGORIES) {
      set.add(cat)
    }
    return Array.from(set)
  }, [allCatalogItems])

  // Filtered catalog items
  const filteredCatalog = useMemo(() => {
    return allCatalogItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.productCode && item.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchCategory =
        selectedCategory === 'All' || item.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [allCatalogItems, searchTerm, selectedCategory])

  // Summary counts for catalog (only count items with an explicit quantity > 0)
  const selectedEntries = useMemo(() => {
    return Object.entries(selectedQuantities).filter(
      ([, qty]) => typeof qty === 'number' && qty > 0
    ) as [string, number][]
  }, [selectedQuantities])

  const totalSelectedCount = selectedEntries.length
  const totalSelectedAmount = selectedEntries.reduce((sum, [id, qty]) => {
    const item = allCatalogItems.find((c) => c.id === id)
    return sum + (item ? item.unitPrice * qty : 0)
  }, 0)

  const handleToggleCatalogItem = (item: CatalogDisplayItem) => {
    setSelectedQuantities((prev) => {
      const next = { ...prev }
      if (next[item.id] !== undefined) {
        delete next[item.id]
      } else {
        // Do NOT default to 1! Leave empty with placeholder 0 so user explicitly specifies quantity
        next[item.id] = ''
      }
      return next
    })
  }

  const handleUpdateQuantity = (itemId: string, rawVal: string) => {
    setSelectedQuantities((prev) => {
      const next = { ...prev }
      if (rawVal === '') {
        next[itemId] = ''
      } else {
        const parsed = parseInt(rawVal, 10)
        if (isNaN(parsed) || parsed < 0) {
          next[itemId] = ''
        } else {
          next[itemId] = parsed
        }
      }
      return next
    })
  }

  const handleAddCatalogItems = () => {
    const itemsToAdd: PRItem[] = []
    for (const [id, qty] of selectedEntries) {
      const catalog = allCatalogItems.find((c) => c.id === id)
      if (!catalog) continue

      itemsToAdd.push({
        id: generateUUID(),
        itemId: catalog.id,
        itemName: catalog.name,
        description: catalog.description,
        category: catalog.category,
        quantity: qty,
        unitOfMeasure: catalog.unitOfMeasure,
        unitPrice: catalog.unitPrice,
        totalAmount: qty * catalog.unitPrice,
        setQuantity: qty,
        remainingQuantity: 0,
        source: 'catalog',
        procurementModeName: catalog.procurementModeName || undefined,
        fund: 'General Fund',
        month: 'January',
      })
    }

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd)
      setSelectedQuantities({})
      setSearchTerm('')
      onOpenChange(false)
    }
  }

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const qtyNum = typeof customQty === 'number' && customQty > 0 ? customQty : 1
    const priceNum = typeof customPrice === 'number' ? customPrice : 0
    const newItem: PRItem = {
      id: generateUUID(),
      itemId: generateUUID(),
      itemName: customName.trim(),
      description: customDescription.trim(),
      category: customCategory,
      quantity: qtyNum,
      unitOfMeasure: customUom,
      unitPrice: priceNum,
      totalAmount: qtyNum * priceNum,
      setQuantity: qtyNum,
      remainingQuantity: 0,
      source: 'custom',
      isNonCSE: customIsNonCSE,
      procurementModeName: customMode && customMode !== 'unassigned' ? customMode : undefined,
      fund: customFund,
      month: customMonth,
    }

    onAddItems([newItem])

    if (alsoSubmitAsItemRequest) {
      onSubmitItemRequest?.(newItem)
    }

    // Reset custom form
    setCustomName('')
    setCustomDescription('')
    setCustomQty('')
    setCustomPrice('')
    setAlsoSubmitAsItemRequest(false)
    setFundOpen(false)
    onOpenChange(false)
  }

  const handleProposeItemRequestOnly = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!customName.trim()) {
      toast.error('Please enter an item name before submitting an item request')
      return
    }
    const qtyNum = typeof customQty === 'number' && customQty > 0 ? customQty : 1
    const priceNum = typeof customPrice === 'number' ? customPrice : 0
    const draftItem: PRItem = {
      id: generateUUID(),
      itemId: generateUUID(),
      itemName: customName.trim(),
      description: customDescription.trim(),
      category: customCategory,
      quantity: qtyNum,
      unitOfMeasure: customUom,
      unitPrice: priceNum,
      totalAmount: qtyNum * priceNum,
      setQuantity: qtyNum,
      remainingQuantity: 0,
      source: 'custom',
      isNonCSE: customIsNonCSE,
      procurementModeName: customMode,
      fund: customFund,
      month: customMonth,
    }
    onSubmitItemRequest?.(draftItem)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl h-[780px] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border bg-white dark:bg-slate-900">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50/60 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Add Items to PR
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Browse available catalog items or add a procurement-specific Custom / Ad-hoc item directly to this PR.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-200 text-xs font-semibold px-2.5 py-1">
              Item Requisition
            </Badge>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'catalog' | 'custom')}
            className="w-full mt-4"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="catalog" className="gap-2 text-xs font-semibold">
                <Boxes className="h-3.5 w-3.5" />
                Master Catalog ({allCatalogItems.length})
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2 text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" />
                Custom / Ad-hoc Item
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {activeTab === 'catalog' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search and Single Category Filter Strip (No scrolling required) */}
            <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Non-CSE items by name, specification, or code..."
                  className="pl-9 h-9 bg-white dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="w-full sm:w-64 shrink-0">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 font-normal">Category:</span>
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat === 'All' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Catalog Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isCatalogLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                  <span className="text-xs">Loading Non-CSE master catalog...</span>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-sm">No Non-CSE catalog items found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search terms or switch to "Custom Non-CSE Item"</p>
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const isChecked = selectedQuantities[item.id] !== undefined
                  const qtyValue = selectedQuantities[item.id] ?? ''
                  const numericQty = typeof qtyValue === 'number' ? qtyValue : 0
                  const Icon = getItemIcon(item.category)

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-4 p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-violet-300 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleCatalogItem(item)}
                          className="mt-1"
                        />
                        <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {item.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5">
                              {item.category}
                            </Badge>
                            {item.productCode && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.productCode}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <span>
                              Unit Price:{' '}
                              <strong className="text-slate-900 dark:text-slate-200">
                                ₱{item.unitPrice.toLocaleString()}
                              </strong>{' '}
                              / {item.unitOfMeasure}
                            </span>
                            {item.procurementModeName && (
                              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                                • {item.procurementModeName}
                              </span>
                            )}
                            {item.isFromApi && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1 font-normal">
                                Master Catalog
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Input with Up/Down Arrows & Subtotal */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isChecked && (
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-slate-500">Qty:</label>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              placeholder="0"
                              value={qtyValue}
                              onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                              className="w-16 h-8 text-center text-xs font-semibold"
                              autoFocus={qtyValue === ''}
                            />
                            <span className="text-xs text-slate-400 w-10">
                              {item.unitOfMeasure}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[80px] text-right">
                              ₱{(item.unitPrice * numericQty).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {totalSelectedCount > 0 ? (
                  <span>
                    Selected <strong>{totalSelectedCount}</strong> Non-CSE item(s) • Total Amount:{' '}
                    <strong className="text-violet-700 dark:text-violet-400 text-sm">
                      ₱{totalSelectedAmount.toLocaleString()}
                    </strong>
                  </span>
                ) : (
                  <span>Select Non-CSE items above to add to your PR</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={totalSelectedCount === 0}
                  onClick={handleAddCatalogItems}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 font-semibold"
                >
                  <Check className="h-4 w-4" />
                  Add {totalSelectedCount > 0 ? `${totalSelectedCount} ` : ''}Item{totalSelectedCount !== 1 ? 's' : ''} to PR
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <form onSubmit={handleAddCustomItem} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Informational banner separating Custom / Ad-hoc from Master Catalog */}
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <span className="font-semibold shrink-0">Note:</span>
              <span>
                Procurement-specific one-off item directly added to this Purchase Request. It does not register into the reusable Master Catalog.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Specialized Server Rack or High-Accuracy Spectrophotometer"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Technical Specifications / Terms of Reference
              </label>
              <Input
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Specific model, brand-neutral specifications, performance metrics, or scope of service"
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unit of Measure
                </label>
                <Select value={customUom} onValueChange={setCustomUom}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">unit</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="set">set</SelectItem>
                    <SelectItem value="lot">lot</SelectItem>
                    <SelectItem value="box">box</SelectItem>
                    <SelectItem value="pack">pack</SelectItem>
                    <SelectItem value="month">month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="0"
                  value={customQty}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomQty(val === '' ? '' : Math.max(0, parseInt(val, 10)))
                  }}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Unit Price (₱) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Procurement Mode
                </label>
                <Select
                  value={customMode || 'unassigned'}
                  onValueChange={(v) => setCustomMode(v === 'unassigned' ? '' : v)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Procurement Mode" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="unassigned" className="text-xs text-muted-foreground">
                      Select Procurement Mode (Optional)
                    </SelectItem>
                    {procurementModeOptions.map((mode) => (
                      <SelectItem key={mode} value={mode} className="text-xs">
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fund Source
                </label>
                <Popover open={fundOpen} onOpenChange={setFundOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={fundOpen}
                      className="w-full h-9 justify-between text-xs font-normal bg-white dark:bg-slate-950 px-3 hover:bg-slate-50 border text-slate-900 dark:text-slate-100"
                    >
                      <span className="truncate">
                        {customFund || 'Select Fund Source'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] min-w-[240px] p-0 shadow-lg border bg-white dark:bg-slate-900 z-50"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search fund source..." className="h-9 text-xs" />
                      <CommandList className="max-h-56 overflow-y-auto">
                        <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
                          No fund source found.
                        </CommandEmpty>
                        <CommandGroup>
                          {fundSourceOptions.map((fund) => {
                            const isSelected = customFund === fund
                            return (
                              <CommandItem
                                key={fund}
                                value={fund}
                                onSelect={() => {
                                  setCustomFund(fund)
                                  setFundOpen(false)
                                }}
                                className="text-xs flex items-center justify-between py-2 px-3 cursor-pointer"
                              >
                                <span className="truncate">{fund}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-violet-600 shrink-0 ml-2" />}
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Item Classification
                </label>
                <Select
                  value={customIsNonCSE ? 'non-cse' : 'cse'}
                  onValueChange={(v) => setCustomIsNonCSE(v === 'non-cse')}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-cse">Non-CSE</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Delivery / Schedule Month
                </label>
                <Select value={customMonth} onValueChange={setCustomMonth}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                      (m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Estimated Amount
                </label>
                <div className="h-9 px-3 rounded-md border bg-slate-50 dark:bg-slate-800 flex items-center font-bold text-sm text-violet-700 dark:text-violet-300">
                  ₱{((typeof customPrice === 'number' ? customPrice : 0) * (typeof customQty === 'number' ? customQty : 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Optional Master Catalog Item Request Proposal */}
            <div className="p-3.5 rounded-xl border border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="alsoSubmitItemRequest"
                  checked={alsoSubmitAsItemRequest}
                  onCheckedChange={(checked) => setAlsoSubmitAsItemRequest(Boolean(checked))}
                  className="mt-0.5 border-violet-400 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                <div className="space-y-0.5 leading-none">
                  <label
                    htmlFor="alsoSubmitItemRequest"
                    className="text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer flex items-center gap-1.5"
                  >
                    <FilePlus className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    Also submit as Item Request to Master Catalog (Optional)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    When checked, saving will add the item directly to this PR and immediately open the Item Request form for BAC review to consider adding it permanently into the agency catalog.
                  </p>
                </div>
              </div>
            </div>
            </div>

            {/* Pinned Bottom Action Bar - Always visible */}
            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleProposeItemRequestOnly}
                className="text-xs border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800 dark:text-violet-300 gap-1.5"
                title="Only submit an Item Request to the BAC without adding it to this PR yet"
              >
                <FilePlus className="h-4 w-4 text-violet-600" />
                Submit as Item Request Only
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom / Ad-hoc Item to PR
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Backward compatibility export alias
export const IndependentItemShoppingModal = AddNonCSEItemModal
