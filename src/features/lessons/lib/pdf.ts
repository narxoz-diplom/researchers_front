import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// pdf.js renders pages to <canvas>: no browser PDF toolbar, no download or print button.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjs }
