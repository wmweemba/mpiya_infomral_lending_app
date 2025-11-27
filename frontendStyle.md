# Mpiya Frontend Style Guide

This document outlines the visual design system used in the Mpiya application. It is designed to help developers replicate the exact look and feel of the app in other projects.

## 1. Color Palette

Mpiya uses a specific HSL (Hue, Saturation, Lightness) color scale to ensure a calm, financial, yet modern aesthetic.

### Main Colors
These are defined in the `tailwind.config.js`.

| Name | Class | Value (HSL) | Hex Approx. | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `bg-primary` | `hsl(210 40% 50%)` | `#4A90E2` | Main buttons, active tabs, branding. |
| **Primary Light** | `bg-primary-light` | `hsl(210 40% 95%)` | `#EDF5FC` | Backgrounds for light actions, numpad buttons. |
| **Primary Dark** | `bg-primary-dark` | `hsl(210 40% 30%)` | `#2E5A8D` | Hover states, dark mode elements. |
| **Secondary** | `bg-secondary` | `hsl(210 40% 98%)` | `#FAFBFC` | Main app background (Light Mode). |
| **Secondary Dark** | `bg-secondary-dark` | `hsl(210 30% 15%)` | `#1B2229` | Main app background (Dark Mode). |
| **Accent** | `bg-accent` | `hsl(160 60% 50%)` | `#33CC99` | Success actions, "Pay" buttons. |

### Status Colors (Standard Tailwind)
| Status | Class | Description |
| :--- | :--- | :--- |
| **Paid/Good** | `text-green-600` / `bg-green-100` | Used for "Paid" badges and collected amounts. |
| **Overdue/Bad** | `text-red-500` / `bg-red-100` | Used for overdue debts and alerts. |
| **Due Today** | `text-yellow-800` / `bg-yellow-100` | Warning state. |
| **Upcoming** | `text-blue-800` / `bg-blue-100` | Neutral/Future state. |

### Neutrals (Slate)
The app uses Tailwind's `slate` scale for text and borders to avoid harsh blacks.
*   **Text Main:** `text-slate-900` (Light Mode) / `text-slate-200` (Dark Mode)
*   **Text Muted:** `text-slate-500` (Light Mode) / `text-slate-400` (Dark Mode)
*   **Borders:** `border-slate-200` or `border-slate-300`

---

## 2. Typography

*   **Font Family:** Default Sans-Serif stack (Inter, Roboto, Segoe UI, etc.).
*   **Weights:**
    *   **Regular (400):** Body text.
    *   **Medium (500):** Labels, subheaders.
    *   **SemiBold (600):** Card values, important statuses.
    *   **Bold (700):** Page Titles (`text-2xl`), Section Headers (`text-xl`).

---

## 3. Iconography

The app uses **Feather Icons** style SVGs.
*   **Style:** Line art (stroke-based).
*   **Stroke Width:** `2px`.
*   **Line Cap/Join:** Round.
*   **Default Size:** `24x24` (`w-6 h-6`).

---

## 4. Components & UI Elements

### A. Cards
Used for Loans, Borrowers, and Dashboard Stats.
*   **Background:** White (`bg-white`) / Dark Slate (`dark:bg-slate-800`).
*   **Border Radius:** `rounded-lg` (8px).
*   **Shadow:** `shadow-sm` (Subtle elevation).
*   **Padding:** `p-4` (16px).
*   **Interaction:** `cursor-pointer`, `hover:shadow-md`, `transition-shadow`.

### B. Buttons
1.  **Primary Action:**
    *   `bg-primary text-white`
    *   `rounded-md`
    *   `px-4 py-2`
    *   `font-semibold`
2.  **Secondary/Cancel:**
    *   `bg-slate-200 dark:bg-slate-700`
    *   `text-slate-900 dark:text-slate-200`
3.  **Floating Action Button (FAB):**
    *   Used for "Add" actions.
    *   `bg-primary text-white`
    *   `rounded-full`
    *   `p-2` or `w-12 h-12`
    *   `shadow-lg`
4.  **Icon Only (Actions):**
    *   `rounded-full`
    *   `p-2`
    *   `bg-slate-100 dark:bg-slate-700`
    *   `hover:text-primary`

### C. Form Inputs
*   **Base:** `block w-full`
*   **Background:** `bg-white dark:bg-slate-800`
*   **Border:** `border-slate-300 dark:border-slate-600`
*   **Rounding:** `rounded-md`
*   **Shadow:** `shadow-sm`
*   **Padding:** `p-2`

### D. Navigation Bar
*   **Position:** Fixed Bottom (`fixed bottom-0`).
*   **Background:** `bg-white dark:bg-slate-800`.
*   **Border:** Top border `border-t border-slate-200`.
*   **Items:** Flex space around.
*   **Active State:** `text-primary`.
*   **Inactive State:** `text-slate-500`.

### E. Modals / Overlays
*   **Backdrop:** `fixed inset-0 bg-black bg-opacity-50` (Dimmed background).
*   **Container:**
    *   `bg-secondary dark:bg-secondary-dark`
    *   `rounded-lg`
    *   `p-6`
    *   `max-w-md` (Restricted width for readability).
    *   `m-4` (Margin to prevent touching screen edges on mobile).

---

## 5. Layout Structure

*   **Header:** Sticky or static top bar, white background, shadow-sm. Contains Title, Sync, Dark Mode, Lock.
*   **Main Content Area:**
    *   `max-w-2xl` (Restricted width centered on desktop).
    *   `mx-auto` (Center horizontally).
    *   `p-4` (Padding).
    *   `pb-20` (Bottom padding to prevent content being hidden behind the nav bar).

---

## 6. Animations
*   **Spin:** `animate-spin` for loading/sync icons.
*   **Shake:** Custom `animate-shake` for invalid passcode entry (see `index.css`).
*   **Transitions:** `transition-colors`, `transition-shadow` on interactive elements.
