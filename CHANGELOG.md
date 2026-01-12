# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Currency filter for stores page to filter stores by USD, CAD, or GBP.
- Tenant exclusion in "Add Tenant" dropdown - tenants already added to Tenant-Specific Features are excluded from the dropdown.
- Supplier management system allowing up to 5 suppliers per store (excluding combos) with margin percentage settings.
- Automatic supplier selection based on highest margin percentage.
- Random margin initialization (3%-15%) for each store's suppliers on first load.
- Supplier offerings system - some stores may not have offerings from certain suppliers, displayed with "Not Offering" badge.
- Single supplier selection per store - only one supplier can be selected at a time.
- Store type assignment: "Close" for regular stores, "Open" for stores with "Visa" in name, "Combo" for combo instances.
- Store type filter allowing filtering by Close, Open, or Combo store types.
- Selected supplier filter to filter stores by which supplier is selected (Supplier 1-5 or No Supplier).
- Alphabetical sorting (A to Z) for the store list.
- "Force supplier" feature in Tenant-Specific Features allowing tenants to only select stores from a specific supplier.
- Catalog-Level Fee renamed to Catalog-Level Discount.
- UI reordering in Catalogs page - "Manage Stores" section now appears before "Tenant-Specific Features" box.
- "Add Tenant" dropdown moved to the last position within Tenant-Specific Features box.
- "Current Stores" section shown before "Available Stores" within Manage Stores.
- "Add All" button in "Available Stores & Combos" section to quickly add all available items.
- Event-based features system - discounts, stores, and order configurations are now wrapped by an "event" concept, allowing different sets of features for different events (e.g., "Default", "Corporate", "Bulk").
- Event name uniqueness validation - users cannot create multiple events with the same name (case-insensitive check).
- Store pricing type indication - each non-combo store displays a badge showing "Variable" or "Fixed" pricing type.
- Tooltip for pricing type badges - "Variable pricing" shows "0-2000$" tooltip, "Fixed pricing" shows specific denomination options (e.g., "5,15,25,50", "25,50,75", or "10,50,100,150,200").
- Cursor help indicator for pricing type badges - cursor changes to help cursor when hovering over pricing type.
- Pricing type badges in master combo "Select Stores" dropdown showing Variable or Fixed pricing for each store.
- Terms & Conditions and Description fields for each store and combo instance, editable via modal interface.
- Random supplier unavailability - Supplier 1 is randomly unavailable for approximately 35% of brands, and suppliers 2, 3, 4, and 5 are each randomly unavailable for approximately 20% of stores.
- Supplier availability display in Manage Stores popup - unavailable suppliers are shown as "N/A" in the store configuration section.
- Unavailable suppliers in Manage Suppliers modal now display "N/A" in the margin field instead of hiding it completely.
- Amazon (US) store now has Supplier 3 marked as unavailable by default.
- Added safeguards to prevent selecting unavailable suppliers - validation in backend functions, UI prevents interaction, and automatic cleanup of invalid selections.
- Create Store popup now supports setting supplier margins, selecting primary (selected) supplier, and selecting secondary supplier for regular stores.
- Added DB Cards summary view in Stores page showing "Total DB Cards" and "Value of Total Cards" with clickable card to view detailed table of Store Name, Qty in DB, and Value.
- Added image upload/update functionality for each store - users can upload images via URL or file upload, with preview and remove options.
- Added store count display in Force Supplier section showing how many stores are available from the selected supplier.
- Added "Based on Defaults" indicator for combo cards showing Yes/No status, and "Edit Stores" option for non-default combos to customize store selection.

### Changed
- Changed terminology from "Discount" to "Margin" throughout the stores page.
- Preview logic updated to correctly filter combo instances based on tenant-specific settings.

### Fixed
- Fixed preview discrepancy where "Default Combo Card" was appearing in tenant preview even when not explicitly added to tenant's features.
- Fixed UI count for "Current Stores & Combos" in Tenant-Specific Features after removing stores.
- Fixed "Variable pricing" badge breaking box style by adding flex-wrap to container.
- Fixed cursor styling when hovering over "Variable pricing" badge.
- Ensured exactly 10 different combo cards are always present on stores page after dev server restart.
