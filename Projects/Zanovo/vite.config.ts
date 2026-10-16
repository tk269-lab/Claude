import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROUTE_META, metaFor } from './src/lib/routeMeta.js'

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/* WhatsApp, Facebook and LinkedIn link previews do not run JavaScript, so each
   page gets its own copy of the built index.html with its tags baked in
   (dist/care/index.html, ...). Vercel serves a matching file before the SPA
   rewrite; the app itself boots exactly as it does from index.html. */
function routeHtml(): Plugin {
  let outDir = 'dist'
  return {
    name: 'zanovo-route-html',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const base = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const path of Object.keys(ROUTE_META)) {
        if (path === '/') continue
        const m = metaFor(path)
        let html = base
        const swap = (pattern: RegExp, value: string) => {
          if (!pattern.test(html)) throw new Error(`zanovo-route-html: ${pattern} not found in index.html`)
          html = html.replace(pattern, (_match, before: string, after: string) => before + escapeAttr(value) + after)
        }
        swap(/(<title>)[^<]*(<\/title>)/, m.title)
        swap(/(<meta name="description" content=")[^"]*(")/, m.description)
        swap(/(<meta property="og:title" content=")[^"]*(")/, m.title)
        swap(/(<meta property="og:description" content=")[^"]*(")/, m.shareDescription)
        swap(/(<meta property="og:url" content=")[^"]*(")/, m.url)
        swap(/(<meta name="twitter:title" content=")[^"]*(")/, m.title)
        swap(/(<meta name="twitter:description" content=")[^"]*(")/, m.shareDescription)
        swap(/(<link rel="canonical" href=")[^"]*(")/, m.url)
        if (m.noindex) html = html.replace('<title>', '<meta name="robots" content="noindex, nofollow" />\n    <title>')
        const dir = join(outDir, path.slice(1))
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), routeHtml()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
