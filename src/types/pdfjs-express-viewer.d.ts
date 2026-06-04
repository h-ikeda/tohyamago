// @pdftron/pdfjs-express-viewer は型定義を同梱していないため最小限の宣言を補う。
declare module '@pdftron/pdfjs-express-viewer' {
  interface ViewerOptions {
    licenseKey?: string
    initialDoc?: string
    filename?: string
  }

  const PdfjsExpressViewer: (
    options: ViewerOptions,
    element: HTMLElement,
  ) => Promise<unknown>

  export default PdfjsExpressViewer
}
