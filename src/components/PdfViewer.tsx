import { useRef, useEffect } from 'react'

interface Props {
  src: string
  filename: string
  licenseKey?: string
}

export default function PdfViewer({ src, filename, licenseKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    let destroyed = false
    import('@pdftron/pdfjs-express-viewer').then(
      ({ default: PdfjsExpressViewer }) => {
        if (destroyed) return
        PdfjsExpressViewer({ licenseKey, initialDoc: src, filename }, el)
      },
    )
    return () => {
      destroyed = true
      el.innerHTML = ''
    }
  }, [src, filename, licenseKey])

  return <div ref={containerRef} className="h-full" />
}
