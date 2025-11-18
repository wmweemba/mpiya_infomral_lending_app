# Changelog

All notable changes to the "Mpiya" project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-05-23

### Added
- **Loan Management:** Added ability to **Edit** and **Delete** loans directly from the list view.
- **Deployment:** Added support for Vercel deployment using Environment Variables (`import.meta.env`) for secure credential management.
- **Build System:** Created local CSS entry point (`index.css`) and Tailwind configuration for production builds.

### Changed
- **Database:** Upgraded IndexedDB schema to Version 2. Added `loanId` index to the `payments` store to support cascading deletions.
- **Architecture:** Migrated from CDN-based imports to a standard Vite + npm dependency model.
- **UI:** Improved Loan card interaction; Edit/Delete buttons now properly stop event propagation to prevent opening the details modal accidentally.

### Fixed
- Fixed `Uncaught TypeError` regarding `VITE_PASSCODE` by adding safety checks for environment variables.
- Fixed module resolution errors by switching `App.tsx` to a named export.
- Fixed "Delete Loan" button inactivity by resolving event bubbling conflicts.

## [1.0.0] - 2024-05-23

### Added
- **Core Logic:** Implemented Zambian Kwacha currency formatting, simple interest calculation based on weekly tenors, and automatic overdue penalty logic (+5% per week).
- **Storage:** Integrated `idb` for robust, offline-first IndexedDB storage for Loans, Borrowers, and Payments.
- **Authentication:** Added an App Lock screen with a numerical passcode (Default: 7802) and inactivity timeout.
- **Google Integration:**
  - Implemented Google Identity Services for user authentication.
  - Added Google Drive Sync to backup the full database state as JSON.
  - Added Google Sheets Sync to export loan data to a master spreadsheet.
- **UI/UX:**
  - Mobile-first, responsive design using Tailwind CSS.
  - Dark Mode support with persistent local storage preference.
  - Dashboard with high-level statistics (Active Loans, Outstanding Principal, Expected Interest).
- **Reports:** Added a dedicated Reports screen with "Total Lent" and "Profit" metrics, plus PDF and CSV export functionality.
- **PWA:** Configured `vite-plugin-pwa` with manifest generation and "Install App" prompt handling.

### Changed
- Refactored the UI layout to be centered and max-width constrained for better desktop viewing while maintaining mobile-first priority.
- Updated Google API implementation to use `gapi.client.request` for more reliable multipart file uploads.
- Moved navigation to a fixed bottom bar for easier mobile access.

### Fixed
- Fixed an issue where the Google Auth client was initializing incorrectly with an empty callback.
- Corrected the import of `LoanStatus` enum in utility functions.
- Resolved layout issues where dropdowns were spanning the full screen width on larger devices.

### Configuration
- Updated `constants.ts` with valid Google API placeholders and client configuration instructions.
- Added `vite.config.ts`, `tailwind.config.js`, and `tsconfig.json` for a complete build ecosystem.
