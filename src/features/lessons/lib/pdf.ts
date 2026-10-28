import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// pdf.js renders pages to <canvas>: no browser PDF toolbar, no download or print button.
// The query string is a cache key, not a parameter: browsers that fetched the
// worker while the server still served .mjs as application/octet-stream keep
// that response for a year (immutable), and a module worker from it fails.
// Bump it whenever the served MIME type of /assets/*.mjs changes.
pdfjs.GlobalWorkerOptions.workerSrc = `${workerUrl}?v=2`

export { pdfjs }
