# Implementation Plan - Personal Expense Manager (Sổ Chi Tiêu)

Building a modern, feature-rich, responsive, and SEO-optimized personal expense management web application in Vietnamese ("Sổ Chi Tiêu Pro").

## Proposed Web Architecture

The application will be built using modern web standards (HTML5, Vanilla CSS3 with CSS variables and glassmorphism styling, and Modular ES6 JavaScript) with no external server dependencies required to run, making it blazingly fast and privacy-focused with `localStorage` persistence.

```
/Users/vinhdv/Tai_lieu/Clone/SoChiTieu/
├── index.html              # Main HTML markup with SEO metadata, structured data & semantic tags
├── css/
│   ├── main.css            # Base styles, typography, layout grid, CSS custom properties & theme tokens
│   ├── components.css      # Header, cards, buttons, badges, modals, toast notifications, search bar
│   ├── navigation.css      # Desktop header nav & Mobile sticky bottom navigation bar
│   └── charts.css          # Visual styling for category breakdown donut charts and bar graphs
├── js/
│   ├── app.js              # Application entry point, tab switching & event listeners
│   ├── store.js            # Reactive state management, CRUD, localStorage persistence & sample data
│   ├── ui.js               # Safe DOM rendering (XSS-safe textContent), modal handling, toast alerts
│   ├── charts.js           # Lightweight SVG/Canvas dynamic interactive expense breakdown charts
│   └── utils.js            # Currency formatters (VND), date helper functions, CSV export/import
└── favicon.ico             # App icon asset placeholder
```

## User Review Required

> [!NOTE]
> The app will use `localStorage` for offline data storage by default, so user data stays private in their browser. It will also include JSON/CSV Export & Import so users can backup or transfer their financial records anytime.

## Key Features

1. **SEO Optimization & Accessibility**:
   - Meta title, meta description, OpenGraph (`og:title`, `og:description`, `og:image`), Twitter cards, canonical tags.
   - JSON-LD Structured Data (`schema.org/WebApplication` & `schema.org/FinancialProduct`).
   - Semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`), ARIA labels, and high-contrast light/dark themes.
2. **Transaction Management (CRUD)**:
   - **Create**: Add transactions (Expense / Income) with category, date, payment method, and notes. Quick presets for instant entry.
   - **Read**: List view with grouping by date, badges, amount formatting (e.g. `150.000 ₫`).
   - **Update**: Modal editor to update existing transactions.
   - **Delete**: Custom accessible confirmation modal to remove transactions safely.
3. **Filtering & Search**:
   - Real-time search bar filtering across notes, categories, and payment methods.
   - Filter dropdowns: Category, Transaction Type (Chi tiêu / Thu nhập / Tất cả), Date range (Hôm nay, Tuần này, Tháng này, Tùy chọn).
   - Sorting options (Mới nhất, Cũ nhất, Giá trị cao nhất, Giá trị thấp nhất).
4. **Reports & Analytics**:
   - **Daily Report**: View breakdown of daily spending with average daily spend indicator.
   - **Monthly Report**: Month-over-month comparison and monthly total overview.
   - **Interactive Charts**: Responsive SVG Donut Chart for Category breakdown and Bar Chart for income vs expense trends.
5. **Mobile-First Responsive UI**:
   - Dynamic header on desktop; sticky bottom navigation bar on mobile devices (`< 768px`).
   - Responsive flex/grid card layouts and touch-friendly controls.
   - Light / Dark mode toggle with persistent user preference.

## Proposed Changes

### Core Frontend Files

#### [NEW] [index.html](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/index.html)
- Webpage structure with SEO metadata, meta viewport, Open Graph header tags, and JSON-LD schema script.
- Sections for: Overview Dashboard, Transaction List & Form Modal, Daily/Monthly Reports & Charts, Data Settings (Export/Import/Sample Data).
- Mobile bottom navigation bar and accessible dialog modals.

#### [NEW] [css/main.css](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/css/main.css)
- CSS Custom Properties for light and dark themes (gradients, primary accents, text hierarchy).
- Reset, typography with Google Fonts (Plus Jakarta Sans / Inter), base animations, glassmorphism containers.

#### [NEW] [css/components.css](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/css/components.css)
- Component styles for cards, forms, buttons, inputs, transaction list items, badges, custom modals, toast notifications.

#### [NEW] [css/navigation.css](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/css/navigation.css)
- Desktop header styling and mobile responsive bottom navigation bar (`fixed` bottom position on small viewports).

#### [NEW] [css/charts.css](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/css/charts.css)
- Styling for category donut charts, legend indicators, bar chart columns, and report cards.

#### [NEW] [js/store.js](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/js/store.js)
- State management: `getTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`, `clearAll()`, `loadSampleData()`.
- Initial mock data generation for demonstration.

#### [NEW] [js/utils.js](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/js/utils.js)
- Currency formatting for VND (`Intl.NumberFormat('vi-VN')`), date parsing/formatting, search/filter helper functions, CSV export/import generator.

#### [NEW] [js/ui.js](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/js/ui.js)
- Secure DOM rendering without `innerHTML` vulnerability (using `textContent`, `document.createElement`, and `replaceChildren`).
- Toast notifications and modal dialog triggers.

#### [NEW] [js/charts.js](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/js/charts.js)
- Dynamic SVG Donut Chart generation and Canvas Bar Graph for daily/monthly analytics rendering.

#### [NEW] [js/app.js](file:///Users/vinhdv/Tai_lieu/Clone/SoChiTieu/js/app.js)
- App initialization, tab navigation logic, theme switcher, event handlers binding.

## Verification Plan

### Automated / Syntax Verification
- Serve app using `python3 -m http.server 8080` or `npx http-server`.
- Test web app using `browser_subagent` to check desktop and mobile viewport behavior, CRUD operations, search filters, and report charts.

### Security & XSS Verification
- Validate strict XSS prevention: Dynamic strings rendered exclusively through `textContent` and safe element construction (`document.createElement`).
- Verify no `alert()` or `confirm()` native calls (using built-in custom accessible modals).
- Ensure no sensitive tokens stored in unencrypted memory.

### Manual / Browser Verification
- Test creating, editing, and deleting transactions.
- Test searching by text (e.g. "Cà phê", "Lương") and filtering by date/category.
- Test daily and monthly report views with chart hover tooltips.
- Test mobile view (`375x812` / `414x896`) ensuring mobile bottom navigation and responsive modals work seamlessly.
