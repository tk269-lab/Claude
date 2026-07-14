# Working Preferences

## Presentation format
- **Always present deliverables to the user as a PDF document, not a Markdown file.**
  When creating something to show the user (itineraries, reports, plans, etc.),
  generate a polished PDF and send it via SendUserFile. Markdown/HTML source can
  live in the repo, but the thing shown to the user should be the PDF.
- Generate PDFs from styled HTML using the pre-installed Chromium:
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --no-sandbox --print-to-pdf=out.pdf --no-pdf-header-footer input.html`

## Money / currency
- **Present all costs in South African Rand (ZAR / R).** Convert other currencies
  and note the approximate exchange rate used.
