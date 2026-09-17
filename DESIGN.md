# Design System & UI/UX Specification: Cloud POS SaaS

## 1. Executive Summary & Design Philosophy

This document defines the visual guidelines, design tokens, core component library, and UX architecture for a modern Cloud Point of Sale (POS) SaaS platform. 

The aesthetic is directly informed by the **Modern Editorial SaaS** paradigm (inspired by platforms like Jasper AI):
* **Editorial & High-Craft:** Elevated typography pairing featuring a high-contrast serif for headings and hero moments, departing from sterile corporate aesthetics.
* **Warm & Organic Palette:** Centered around a distinctive warm terracotta and baked coral accent palette rather than generic cold blues.
* **Precision Blueprint Motif:** A subtle graph paper/grid canvas background that conveys architectural accuracy, structure, and operational reliability.
* **Tactile High-Contrast Interfaces:** Clean, modular cards with crisp borders and generous touch targets tailored for high-speed counter operations.

---

## 2. Color System & Design Tokens

### 2.1 Primary & Accent Tokens (Warm Terracotta)

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `primary-50` | `#FDF3F0` | Soft highlight, active row background, light pill background |
| `primary-100` | `#FBE6E1` | Subtle badges, selected option borders |
| `primary-500` | `#E05338` | Primary CTA, checkout buttons, active toggles, brand icons |
| `primary-600` | `#C9432B` | Hover states for primary actions |
| `primary-700` | `#A3331F` | Pressed / Active states |

### 2.2 Base, Surface & Canvas Tokens

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `canvas-bg` | `#FBFBFA` | Master viewport canvas (warm off-white) |
| `canvas-grid` | `#E8E8E6` | Pattern stroke for the signature blueprint grid |
| `surface-card`| `#FFFFFF` | Register ticket, product cards, dialog modals |
| `surface-muted`| `#F4F4F2` | Read-only input fields, table headers |
| `border-subtle`| `#E5E7EB` | Dividers, card boundaries, line-item separators |
| `border-strong`| `#111827` | High-contrast secondary outline buttons and inputs |

### 2.3 Typography Color Tokens

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `text-primary` | `#0F172A` | Major headings, unit quantities, total amounts |
| `text-secondary`| `#4B5563` | Item descriptors, SKU labels, secondary navigation |
| `text-muted` | `#9CA3AF` | Form placeholders, shortcut key hints, inactive tabs |

### 2.4 Functional POS Status Tokens

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `status-success` | `#16A34A` | Completed payments, open drawer, inventory in-stock |
| `status-warning` | `#D97706` | Low inventory warnings, held orders, pending sync |
| `status-danger` | `#DC2626` | Void transactions, refunds, network disconnection |

---

## 3. Signature Motif: Blueprint Grid Background

The signature visual element is the mathematical graph-paper grid pattern layered behind major landing, pricing, and administrative views.

### CSS Specification
```css
/* Signature Blueprint Grid Utility */
.bg-grid-blueprint {
  background-color: #FBFBFA;
  background-image: 
    linear-gradient(to right, #E8E8E6 1px, transparent 1px),
    linear-gradient(to bottom, #E8E8E6 1px, transparent 1px);
  background-size: 32px 32px;
}

/* Subdued variant for high-intensity cashier terminal */
.bg-grid-blueprint-subtle {
  background-color: #FBFBFA;
  background-image: 
    linear-gradient(to right, rgba(232, 232, 230, 0.45) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(232, 232, 230, 0.45) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

> **UX Rule:** For the active POS Cashier Terminal, reduce grid opacity to avoid visual fatigue during multi-hour cashier shifts.

---

## 4. Typography Hierarchy

A dual-font hierarchy creates an intentional juxtaposition between editorial branding and rapid transaction scanning.

### Font Families
1. **Display & Editorial Headlines:** `Fraunces` or `Playfair Display` (Serif)
2. **Interface & Operational UI:** `Plus Jakarta Sans` or `Inter` (Sans-Serif)
3. **Financials, SKUs & Calculations:** `JetBrains Mono` or `Chivo Mono` (Monospace with tabular lining)

### Typography Scale

| Scale Token | Font Family | Weight | Size / Line-Height | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `display-2xl` | Serif | Bold (700) | $52\text{ px} / 1.15$ | Marketing hero statements, grand totals |
| `display-xl` | Serif | SemiBold (600) | $36\text{ px} / 1.2$ | Section titles, tier plan names |
| `heading-lg` | Sans | SemiBold (600) | $22\text{ px} / 1.3$ | Modal titles, category tab labels |
| `body-md` | Sans | Regular (400) | $15\text{ px} / 1.5$ | Line item names, order descriptions |
| `tabular-lg` | Monospace | Bold (700) | $24\text{ px} / 1.2$ | POS total price readout, numeric change |
| `tabular-sm` | Monospace | Medium (500) | $13\text{ px} / 1.4$ | SKU codes, tax breakdowns, timestamps |

---

## 5. Component Specifications

### 5.1 Buttons & Interactive Controls

#### Primary Terracotta Button
* **Styling:** `bg-[#E05338]`, text `white`, `border-radius: 8px`, `font-semibold`.
* **Hover / Active:** Darkens to `#C9432B` on hover; active scale transform at $0.98$ for tactile responsiveness.
* **Usage:** "Start Free Trial", "Pay Now (F8)", "Charge Card".

#### Secondary Outline Button
* **Styling:** `bg-white`, border `1.5px solid #111827`, text `#0F172A`, `border-radius: 8px`.
* **Hover:** Subtle tint background `#F9FAFB`.
* **Usage:** "Start Free 7-Day Trial" on pricing cards, "Cancel Order", "Print Stored Receipt".

#### Touch Numpad Tile (POS Keypad)
* **Dimensions:** Minimum $56\text{ px} \times 56\text{ px}$ clickable area.
* **Surface:** Pure white background, `border: 1px solid #E5E7EB`, micro-shadow `0 1px 2px rgba(0,0,0,0.04)`.
* **Active State:** Instant color flash to `#FDF3F0` to confirm physical or touch tap.

---

### 5.2 Segmented Control (Period / Shift Switcher)

Inspired by the Monthly/Yearly toggle on modern SaaS pricing pages:
* **Container:** Capsule frame (`rounded-lg` or `rounded-full`), white background, `1px border #E5E7EB`, internal padding `4px`.
* **Selected Item:** Solid terracotta fill (`#E05338`), white text, crisp drop shadow.
* **Discount / Highlight Pill:** Inline micro-pill badge (`bg-white/20`, text `white`, `text-xs`) with savings text (e.g., `"Save ~20%"`).
* **Unselected Item:** Transparent background, muted slate text (`#4B5563`).

---

### 5.3 Editorial Subscription & Feature Cards

* **Structure:** White card (`#FFFFFF`), `1px solid #E5E7EB`, border radius `16px`.
* **Shadow:** Ambient elevation `0 10px 30px -4px rgba(0, 0, 0, 0.04)`.
* **Price Header:** Serif headline accompanied by monospace price units (e.g., `$$39\text{/month}$`).
* **Feature List Items:**
  * Custom terracotta checkmark SVG icon (`#E05338`).
  * Generous vertical row gap ($12\text{ px}$) for scanability.
  * Direct, benefit-oriented text strings.

---

### 5.4 POS Digital Receipt & Cart Item Container

* Styled with a physical receipt metaphor: white background, vertical edge, subtle mono divider lines.
* **Item Layout:** Left-aligned product name and modifier tags, right-aligned monospace unit total ($N \times \text{Price}$).
* **Modifier Pills:** Rounded micro-tags indicating add-ons (e.g., `+ Oat Milk`, `Less Ice`).

---

## 6. Viewport & Screen Layout Architecture

### 6.1 Marketing & SaaS Subscription Page
* **Global Navigation:** Clean wordmark on the left, link clusters centered, high-contrast actions ("Log In", "Get a Demo") on the right.
* **Hero Display:** Large centered serif headline with supporting subtitle.
* **Billing Toggle:** Centered segmented control (Monthly vs. Annual billing).
* **3-Tier Subscription Grid:**
  1. **Starter (Single-Terminal / Pop-up):** Basic inventory tracking, single register seat, receipt generator.
  2. **Pro (Multi-Register & F&B):** Table management, kitchen display system (KDS), split bills, ingredient tracking.
  3. **Enterprise (Multi-Outlet Chains):** Centralized warehouse logistics, custom POS hardware integrations, franchise royalty reporting.

---

### 6.2 Cashier Terminal View (High-Efficiency Split Screen)

```
+-------------------------------------------------------------------------------+
| Top Bar: Store Name | Cashier ID | Shift Status | Sync OK [●] | Time: 14:32   |
+----------------------------------------------------+--------------------------+
| Catalog & Keypad Section (65% width)               | Receipt / Ticket (35%)   |
|                                                    | Order #1042 (Dine-in)    |
| [ Search / Barcode Scan (F2) ___________________ ] |                          |
|                                                    | 2x Flat White    $9.00   |
| [All] [Coffee] [Bakery] [Main Course] [Promos]     |    - Extra Shot  $1.00   |
|                                                    | 1x Croissant     $4.50   |
| +-------------+  +-------------+  +-------------+  +--------------------------+
| | Flat White  |  | Cold Brew   |  | Croissant   |  | Subtotal:       $14.50   |
| | $4.50       |  | $5.00       |  | $4.50       |  | Tax (10%):       $1.45   |
| +-------------+  +-------------+  +-------------+  | Total:          $15.95   |
| +-------------+  +-------------+  +-------------+  +--------------------------+
| | Avocado Tst |  | Earl Grey   |  | Danish      |  | [ Hold Order ] [ Disct ] |
| | $12.00      |  | $4.00       |  | $5.00       |  |                          |
| +-------------+  +-------------+  +-------------+  | [  PAY NOW (F8) - $15.95 ]|
+----------------------------------------------------+--------------------------+
```

---

### 6.3 Backoffice Analytics Dashboard
* **Sidebar:** Compact left navigation bar with clean linear icons.
* **Canvas:** Warm off-white background with the signature blueprint grid.
* **Key KPI Metrics:** Gross Revenue, Average Basket Value, Total Transaction Count, Top Selling SKU.
* **Data Presentation:** Clean sparklines and line charts utilizing the terracotta palette alongside muted greys.

---

## 7. Tailwind CSS Configuration Reference

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF3F0',
          100: '#FBE6E1',
          200: '#F5C1B6',
          500: '#E05338', // Brand primary accent
          600: '#C9432B',
          700: '#A3331F',
        },
        canvas: {
          light: '#FBFBFA',
          grid: '#E8E8E6',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#4B5563',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 8px 30px -4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(224, 83, 56, 0.08)',
      }
    },
  },
  plugins: [],
};
```

---

## 8. POS Ergonomics & Cashier Workflow Rules

1. **Touch Ergonomics:**
   * All interactive register components must maintain a minimum bounding box of $48\text{ px} \times 48\text{ px}$ (ideal: $56\text{ px} \times 56\text{ px}$) to prevent cashier mis-taps during rush hours.
2. **Keyboard Accelerators (Keyboard-First Standard):**
   * `F2`: Set cursor focus to global barcode/search query input.
   * `F4`: Open custom discount & surcharge modal.
   * `F8`: Trigger payment modal (Cash, Card, QRIS).
   * `F9`: Quick print last receipt.
   * `ESC`: Dismiss active modal or clear current selection.
3. **High-Contrast Receipt Rendering:**
   * The digital receipt preview must use pure high-contrast monochrome values (`#000000` on `#FFFFFF`) to guarantee precise translation to $58\text{ mm}$ and $80\text{ mm}$ thermal receipt paper.