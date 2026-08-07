import {
  ArrowLeft,
  Package,
  Code,
  CheckCircle,
  AlertCircle,
  Calendar,
  Tag,
  Grid3x3,
  FileImage,
} from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getItemMasterRequest } from '../handlers/getItemMasterRequest'
import { mapProcurementItemToItemMaster } from '../mappers'

interface ItemDetailPageProps {
  itemId: string
  onBack: () => void
}

const useItemMasterQuery = createQueryHookFromTemplate(getItemMasterRequest)

const UACS_CODE_MAP: Record<string, string> = {
  '10101001': 'General Administration and Support',
  '10102001': 'Financial and Accounting',
  '30301001': 'Supplies and Materials',
  '40401001': 'Information Technology',
  '50501001': 'Infrastructure and Construction',
}

const generateUacsCodes = (
  baseCode: string,
): Array<{ code: string; description: string; category: string }> => {
  const primaryDescription =
    UACS_CODE_MAP[baseCode] || baseCode || 'Unknown Category'

  return [
    { code: baseCode, description: primaryDescription, category: 'Primary' },
    {
      code: `${baseCode}-01`,
      description: 'Office Supplies and Materials',
      category: 'Subcategory',
    },
    {
      code: `${baseCode}-02`,
      description: 'Equipment and Machinery',
      category: 'Subcategory',
    },
    {
      code: `${baseCode}-03`,
      description: 'Maintenance and Repair',
      category: 'Subcategory',
    },
  ]
}

export function ItemDetailPage({ itemId, onBack }: ItemDetailPageProps) {
  const { data, isLoading, isError } = useItemMasterQuery({
    pathParams: { id: itemId },
    queryParams: {},
  })

  const item = data?.data ? mapProcurementItemToItemMaster(data.data) : null

  // Debug log to inspect raw backend payload and mapped item (remove after debugging)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('ItemDetailPage - raw API data:', data?.data)
    // eslint-disable-next-line no-console
    console.debug('ItemDetailPage - mapped item:', item)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-lg border bg-background">
        <p className="text-sm text-muted-foreground">Loading item details...</p>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="rounded-lg border bg-background p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Item not found</h1>
            <p className="text-sm text-muted-foreground">
              Unable to load the selected item.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const uacsCodes = generateUacsCodes(item.uacsCode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {item.itemName}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Item ID: {item.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.status === 'active' ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Item Name
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {item.itemName}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Object Code
                  </label>
                  <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                    {item.uacsCode}
                  </code>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    UNSPSC Code
                  </label>
                  <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                    {item.unspscCode}
                  </code>
                </div>

                {/* Product Code - display like Object Code */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Product Code
                  </label>
                  <code className="text-base font-mono bg-slate-50 text-slate-900 px-3 py-2 rounded border border-slate-200 mt-2 block">
                    {item.productCode || '—'}
                  </code>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    Minimum Technical Specifications
                  </label>
                  <div className="bg-slate-50 rounded border border-slate-200 p-3 mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {item.minimumTechnicalSpecifications}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Unit of Measurement
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2 uppercase">
                    {item.uom}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Item Type
                  </label>
                  <div className="mt-2">
                    {(() => {
                      const t = String(item.itemType || '').toLowerCase().replace(/\s+/g, '')

                      if (t === 'expendable') {
                        return <Badge className="bg-green-100 text-green-800">Expendable</Badge>
                      }

                      if (t === 'semiexpendable' || t === 'semiexpendable') {
                        return <Badge className="bg-yellow-100 text-yellow-800">Semi Expendable</Badge>
                      }

                      if (t === 'equipment') {
                        return <Badge className="bg-indigo-100 text-indigo-800">Equipment</Badge>
                      }

                      if (t === 'ppe') {
                        return <Badge className="bg-blue-100 text-blue-800">PPE</Badge>
                      }

                      return <Badge className="bg-gray-100 text-gray-800">{String(item.itemType)}</Badge>
                    })()}
                  </div>
                </div>

                {item.itemLife && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Item Life
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-2">
                      {item.itemLife} {item.itemLifeUnit || 'years'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Status
                  </label>
                  <div className="mt-2">
                    {item.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {item.imageURL && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Image
                    </label>
                    <div className="mt-2">
                      {item.imageURL.startsWith('http') ||
                      item.imageURL.startsWith('blob:') ? (
                        <img
                          src={item.imageURL}
                          alt="Item image"
                          className="max-w-full max-h-48 object-contain rounded border border-slate-200"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileImage className="w-4 h-4" />
                          {item.imageURL}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Related UACS Codes
              </h2>

              <div className="space-y-3">
                {uacsCodes.map((uacs, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <code className="text-sm font-mono font-semibold text-slate-900 break-all">
                        {uacs.code}
                      </code>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {uacs.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{uacs.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Metadata
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500">Created:</span>
                  <p className="font-medium text-slate-900 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Updated:</span>
                  <p className="font-medium text-slate-900 mt-1">
                    {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>
                {item.objectCodeId && (
                  <div>
                    <span className="text-slate-500">Object Code ID:</span>
                    <p className="font-medium text-slate-900 mt-1 break-all">
                      {item.objectCodeId}
                    </p>
                  </div>
                )}
                {item.unspscCodeId && (
                  <div>
                    <span className="text-slate-500">UNSPSC ID:</span>
                    <p className="font-medium text-slate-900 mt-1 break-all">
                      {item.unspscCodeId}
                    </p>
                  </div>
                )}
                {item.uomId && (
                  <div>
                    <span className="text-slate-500">UOM ID:</span>
                    <p className="font-medium text-slate-900 mt-1 break-all">
                      {item.uomId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
