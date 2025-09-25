# United Pharmacies - LMS Dashboard

This is a lightweight dashboard (HTML/CSS/JS) built with Chart.js that visualizes course completion metrics for pharmacists.
Everything is client-side — no backend is required to run a demo.

## Project structure
- `index.html` — Main page (HTML).
- `style.css` — Styles.
- `script.js` — All JavaScript: data, filters, multi-select, and charts.
- Sample data is included inside `script.js` (variable `pharmacistsData`) for demo.

## How to run locally
1. Put all files in a single folder.
2. Open `index.html` in your browser (double-click).  
   - For local CSV/JSON fetches some browsers block `file://` fetches. Use a local server (e.g. `Live Server` in VS Code) or upload to GitHub Pages.

## How to publish (GitHub Pages)
1. Create a public repository on GitHub.
2. Upload the files (`index.html`, `style.css`, `script.js`, `README.md`).
3. In the repo → Settings → Pages: choose `main` branch and `/ (root)` folder, then Save.
4. GitHub Pages link will become available (usually `https://username.github.io/repo-name/`).

## Notes & next steps
- Replace the sample `pharmacistsData` with a real API or JSON file to make it dynamic.
- For Google Sheets, export as CSV and use PapaParse to parse CSV in `script.js`.
- If you need localization (Arabic/English toggle), consider storing UI strings in a `translations` object.
