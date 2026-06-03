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
    import('@pdftron/pdfjs-express-viewer').then(({ default: PdfjsExpressViewer }) => {
      PdfjsExpressViewer({ licenseKey, initialDoc: src, filename }, el)
    })
  }, [])

  return <div ref={containerRef} className="h-full" />
}
