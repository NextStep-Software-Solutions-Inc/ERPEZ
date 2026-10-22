import * as React from 'react'
import {
  fetchAgencyLetterhead,
  updateAgencyLetterhead,
  uploadAgencyLogo,
  clearAgencyLogo,
  fetchAgencyLogoBlob,
  formatLogoUrl,
  type AgencyLetterheadDto,
  type LetterheadAlignmentType,
} from '@/services/api/agencyLetterhead'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Building,
  Upload,
  Trash2,
  RefreshCw,
  FileText,
  ImageIcon,
  CheckCircle2,
  Info,
} from 'lucide-react'

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

async function optimizeImageForDocument(file: File): Promise<File> {
  // If already <= 450 KB, keep original intact
  if (file.size <= 450 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 900
        let { width, height } = img

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        const isPng = file.type === 'image/png'
        const outputType = isPng ? 'image/png' : 'image/jpeg'

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const optimized = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, isPng ? '.png' : '.jpg'),
                { type: outputType }
              )
              resolve(optimized)
            } else {
              resolve(file)
            }
          },
          outputType,
          0.9
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

export function AgencyLetterheadSettings() {
  const [data, setData] = React.useState<AgencyLetterheadDto | null>(null)
  const [agencyName, setAgencyName] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [officeName, setOfficeName] = React.useState('')
  const [letterheadAlignment, setLetterheadAlignment] = React.useState<LetterheadAlignmentType>('Default')
  const [logoPreviewUrl, setLogoPreviewUrl] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [clearingLogo, setClearingLogo] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchAgencyLetterhead()
      setData(res)
      setAgencyName(res.name || '')
      setAddress(res.address || '')
      setOfficeName(res.officeName || '')
      setLetterheadAlignment((res.letterheadAlignment as LetterheadAlignmentType) || 'Default')

      let resolvedLogo = formatLogoUrl(res)
      if (!resolvedLogo && res.hasLogo) {
        resolvedLogo = await fetchAgencyLogoBlob()
      }
      setLogoPreviewUrl(resolvedLogo)
      setSelectedFile(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load agency letterhead settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    if (!ALLOWED_TYPES.includes(rawFile.type)) {
      toast.error('Unsupported file format. Please upload a PNG or JPEG image.')
      return
    }

    if (rawFile.size > MAX_LOGO_SIZE_BYTES) {
      toast.error(`Image exceeds 5 MB limit (${(rawFile.size / (1024 * 1024)).toFixed(1)} MB).`)
      return
    }

    try {
      const file = await optimizeImageForDocument(rawFile)
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setLogoPreviewUrl(objectUrl)
    } catch {
      setSelectedFile(rawFile)
      const objectUrl = URL.createObjectURL(rawFile)
      setLogoPreviewUrl(objectUrl)
    }
  }

  const handleUploadLogo = async () => {
    if (!selectedFile) return

    try {
      setUploadingLogo(true)
      const updated = await uploadAgencyLogo(selectedFile)
      setData(updated)
      let resolvedLogo = formatLogoUrl(updated)
      if (!resolvedLogo && updated.hasLogo) {
        resolvedLogo = await fetchAgencyLogoBlob()
      }
      setLogoPreviewUrl(resolvedLogo)
      setSelectedFile(null)
      toast.success('Agency logo uploaded successfully.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload logo image.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleClearLogo = async () => {
    try {
      setClearingLogo(true)
      await clearAgencyLogo()
      setData((prev) => (prev ? { ...prev, hasLogo: false, logoBytes: null } : null))
      setLogoPreviewUrl(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Agency logo removed. Documents will use standard text header.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove agency logo.')
    } finally {
      setClearingLogo(false)
    }
  }

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyName.trim()) {
      toast.error('Agency Name is required.')
      return
    }

    try {
      setSaving(true)
      const res = await updateAgencyLetterhead({
        name: agencyName.trim(),
        address: address.trim(),
        letterheadAlignment,
      })
      setData(res)
      if (res.hasLogo && !selectedFile) {
        let resolved = formatLogoUrl(res)
        if (!resolved) {
          resolved = await fetchAgencyLogoBlob()
        }
        setLogoPreviewUrl(resolved)
      }
      toast.success('Agency letterhead details saved successfully.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save letterhead details.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading letterhead settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Document Header Live Preview Card ────────────────────────────── */}
      <Card className="border-primary/20 bg-muted/30 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Live Document Header Preview</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {letterheadAlignment === 'Center'
                ? 'Centered Layout'
                : letterheadAlignment === 'Left'
                ? 'Left-Aligned Layout'
                : 'System Default Layout (Tabular: Left, Notices: Centered)'}
            </Badge>
          </div>
          <CardDescription>
            Real-time preview of how your agency branding renders on Purchase Orders and official forms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card p-6 shadow-xs">
            <div className="mb-2 text-right text-[10px] italic text-muted-foreground">
              Appendix 61
            </div>

            {letterheadAlignment === 'Center' ? (
              <div className="space-y-1.5 text-center">
                <div className="flex justify-center pb-1">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-dashed bg-muted/40">
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="Agency Logo"
                        className="max-h-12 max-w-12 object-contain"
                        onError={() => setLogoPreviewUrl(null)}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">Republic of the Philippines</div>
                <div className="text-sm font-bold tracking-tight text-foreground">
                  {agencyName || 'Agency Name'}
                </div>
                {address && (
                  <div className="text-[11px] text-muted-foreground">{address}</div>
                )}
                {officeName && (
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {officeName}
                  </div>
                )}
                <div className="mx-auto my-2.5 h-[0.5px] w-full max-w-md bg-border" />
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  PURCHASE ORDER
                </div>
                <div className="mx-auto mt-1 h-[1.5px] max-w-[180px] bg-foreground/80" />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4">
                  {/* Logo Area */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-dashed bg-muted/40">
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="Agency Logo"
                        className="max-h-12 max-w-12 object-contain"
                        onError={() => setLogoPreviewUrl(null)}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Title & Entity Details */}
                  <div className="flex-1 text-left">
                    <div className="text-[10px] text-muted-foreground">Republic of the Philippines</div>
                    <div className="text-sm font-bold tracking-tight text-foreground">
                      {agencyName || 'Agency Name'}
                    </div>
                    {address && (
                      <div className="text-[11px] text-muted-foreground">{address}</div>
                    )}
                    {officeName && (
                      <div className="text-[11px] font-medium text-muted-foreground">
                        {officeName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    PURCHASE ORDER
                  </div>
                  <div className="mx-auto mt-1 h-[1.5px] max-w-[180px] bg-foreground/80" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Form Section ─────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Legal Name & Address */}
        <Card>
          <form onSubmit={handleSaveTextSettings}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Agency Identity</CardTitle>
              </div>
              <CardDescription>
                Configure the procuring entity name and postal address applied across procurement documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="agency-name">
                  Agency / Procuring Entity Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agency-name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Department of Science and Technology"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Official registered title of the government agency, SUC, or local government unit.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="agency-address">Official Postal Address</Label>
                <Textarea
                  id="agency-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Gen. Santos Ave., Central Bicutan, Taguig City, Metro Manila"
                  rows={3}
                />
                <p className="text-[11px] text-muted-foreground">
                  Printed beneath the agency title on procurement document headers.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="letterhead-alignment">Letterhead Alignment</Label>
                <Select
                  value={letterheadAlignment}
                  onValueChange={(val) => setLetterheadAlignment(val as LetterheadAlignmentType)}
                >
                  <SelectTrigger id="letterhead-alignment" className="w-full">
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default">System Default (Recommended)</SelectItem>
                    <SelectItem value="Left">Always Left</SelectItem>
                    <SelectItem value="Center">Always Center</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Controls letterhead layout across official PDF documents. System Default uses left alignment for tabular COA/DBM forms and centered alignment for legal notices and awards.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Entity Details
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Right Column: Logo Upload & Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Official Logo</CardTitle>
            </div>
            <CardDescription>
              Upload the official agency seal or logo rendered alongside the document header.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted/30 p-1">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setLogoPreviewUrl(null)}
                  />
                ) : (
                  <div className="text-center text-xs text-muted-foreground">
                    <ImageIcon className="mx-auto mb-1 h-6 w-6 opacity-40" />
                    No Logo
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">Logo Specifications</div>
                <ul className="text-[11px] text-muted-foreground space-y-0.5">
                  <li>• Format: PNG or JPEG (transparent background recommended)</li>
                  <li>• Maximum file size: 5 MB (optimized for high-resolution print)</li>
                  <li>• Renders at 36pt height in Appendix 61 header</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? 'Change Selection' : 'Select Image File'}
                </Button>

                {selectedFile && (
                  <Button
                    type="button"
                    onClick={handleUploadLogo}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Save Logo'
                    )}
                  </Button>
                )}

                {(data?.hasLogo || selectedFile) && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleClearLogo}
                    disabled={clearingLogo}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              {selectedFile && (
                <div className="text-[11px] text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 rounded-md border border-primary/10 bg-primary/5 p-3 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Removing the logo will revert documents to the standard centered text header compliant with government audit requirements.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
