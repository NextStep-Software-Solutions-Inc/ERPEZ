import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { LucideImage, Loader2 } from 'lucide-react'

export interface DocumentViewerProps {
  src?: string | null
  alt?: string
  /** Size preset: xs (10x10), sm (16x16), md (24x24), lg (32x32), xl (48x48), full (100%) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  width?: string | number
  height?: string | number
  /** Aspect ratio preset: square, video, portrait, auto */
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
  className?: string
  /** Fallback initials to display if no image or error */
  fallbackInitials?: string
  /** Extra Tailwind classes for fallback container background */
  fallbackBgClass?: string
  /** Whether clicking the image opens a full-screen zoom lightbox */
  enableLightbox?: boolean
}

const sizeClasses = {
  xs: 'w-10 h-10',
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
  full: 'w-full h-full',
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: 'aspect-auto',
}

export default function DocumentViewer({
  src,
  alt = 'Document',
  size = 'md',
  width,
  height,
  aspectRatio = 'square',
  className,
  fallbackInitials,
  fallbackBgClass,
  enableLightbox = true,
}: DocumentViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!src) {
      setObjectUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    if (
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('http://') ||
      src.startsWith('https://')
    ) {
      setObjectUrl(src)
      setLoading(false)
      setError(false)
      return
    }

    // Extract file ID from path (like /files/download/UUID or download/UUID etc)
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    const uuidMatch = src.match(uuidRegex)
    if (!uuidMatch) {
      setObjectUrl(src)
      setLoading(false)
      setError(false)
      return
    }

    const fileId = uuidMatch[0]
    let isMounted = true
    setLoading(true)
    setError(false)

    api
      .get(`/files/download/${fileId}`, { responseType: 'blob' })
      .then((response) => {
        if (!isMounted) return
        const contentType = response.headers['content-type'] || 'image/png'
        const blob = new Blob([response.data], { type: contentType as string })
        const url = URL.createObjectURL(blob)
        setObjectUrl(url)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to download document:', err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [src])

  // Revoke object URL on change/unmount
  useEffect(() => {
    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  }

  // Fallback UI
  const renderFallback = () => {
    if (fallbackInitials) {
      return (
        <div
          className={cn(
            'flex items-center justify-center font-bold text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded-lg select-none uppercase',
            fallbackBgClass,
            'w-full h-full',
          )}
        >
          {fallbackInitials.slice(0, 2)}
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-lg w-full h-full">
        <LucideImage className="h-1/3 w-1/3 min-h-[16px] min-w-[16px] stroke-[1.5]" />
      </div>
    )
  }

  const containerClasses = cn(
    'relative overflow-hidden rounded-lg border border-slate-100 shadow-sm bg-white group select-none transition-all duration-300 hover:shadow-md',
    sizeClasses[size],
    aspectRatios[aspectRatio],
    className,
  )

  if (loading) {
    return (
      <div
        className={cn(
          containerClasses,
          'flex items-center justify-center bg-slate-50/50',
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !objectUrl) {
    return (
      <div className={containerClasses} style={customStyle}>
        {renderFallback()}
      </div>
    )
  }

  const imageElement = (
    <img
      src={objectUrl}
      alt={alt}
      className={cn(
        'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
        enableLightbox && 'cursor-zoom-in',
      )}
      onError={() => setError(true)}
    />
  )

  if (!enableLightbox) {
    return (
      <div className={containerClasses} style={customStyle}>
        {imageElement}
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            containerClasses,
            'text-left block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          )}
          style={customStyle}
        >
          {imageElement}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-[10px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Click to Zoom
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        size="lg"
        className="p-0 border-none bg-black/95 overflow-hidden flex items-center justify-center max-h-[85vh]"
      >
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={objectUrl}
            alt={alt}
            className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
          />
          {alt && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="inline-block bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white max-w-[80%] truncate">
                {alt}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
