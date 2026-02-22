# Fund Import System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a 4-tab fund import system supporting Search, Manual Entry, Excel Upload, and OCR screenshot import methods.

**Architecture:** Create a modular ImportModal container with tab-based navigation. Each tab is an independent component that outputs standardized `ImportHolding[]` data. A shared ImportPreview component validates and displays data before saving to IndexedDB via Dexie.

**Tech Stack:** React + TypeScript, xlsx (Excel parsing), tesseract.js (client-side OCR), TailwindCSS, Radix UI Tabs, Dexie (IndexedDB)

---

## Current State Analysis

### Existing Components to Reuse/Adapt:
- `src/components/add-holding-modal.tsx` - Search functionality and form patterns
- `src/components/data-import-export.tsx` - File upload patterns and CSV parsing
- `src/lib/db.ts` - Database operations (holdingDb.create, holdingDb.bulkCreate)
- `src/services/fund.ts` - Fund search API
- `src/types/index.ts` - Existing Holding, Fund types

### Dependencies Already Installed:
- `xlsx@^0.18.5` - Excel file parsing
- `tesseract.js@^7.0.0` - OCR text extraction
- `@radix-ui/react-tabs@^1.0.4` - Tab navigation

---

## File Structure

```
src/
├── components/
│   └── import/
│       ├── ImportModal.tsx           # Main container with tabs
│       ├── ImportPreview.tsx         # Data validation & preview table
│       ├── SearchTab.tsx             # Tab 1: Search funds
│       ├── ManualTab.tsx             # Tab 2: Manual form input
│       ├── ExcelTab.tsx              # Tab 3: Excel upload
│       └── OCRTab.tsx                # Tab 4: Screenshot OCR
├── lib/
│   └── import/
│       ├── excel-parsers.ts          # Alipay/WeChat/Ant parsers
│       ├── ocr-service.ts            # Tesseract.js wrapper
│       └── fund-extractor.ts         # Extract fund data from text
├── types/
│   └── import.ts                     # Import-specific types
└── hooks/
    └── useImport.ts                  # Shared import state hook
```

---

## Shared Types (src/types/import.ts)

```typescript
/** Import source type */
export type ImportSource = 'search' | 'manual' | 'excel' | 'ocr';

/** Import channel options */
export type ImportChannel = 
  | '蚂蚁财富' 
  | '天天基金' 
  | '且慢' 
  | '招商银行' 
  | '支付宝' 
  | '微信理财通' 
  | '其他';

/** Raw holding data from any import source */
export interface ImportHolding {
  id?: string;                      // Temporary ID for preview
  fundId: string;                   // 6-digit fund code
  fundName: string;                 // Fund name
  fundType?: string;                // Fund type (optional)
  shares: number;                   // Total shares
  avgCost: number;                  // Average cost per share
  channel?: ImportChannel;          // Purchase channel
  group?: string;                   // Portfolio group
  source: ImportSource;             // Which tab imported this
  rawData?: unknown;                // Original parsed data for debugging
  errors?: ImportValidationError[]; // Validation errors
}

/** Validation error */
export interface ImportValidationError {
  field: keyof ImportHolding;
  message: string;
}

/** Parsed result from Excel */
export interface ExcelParseResult {
  holdings: ImportHolding[];
  format: 'alipay' | 'wechat' | 'ant' | 'unknown';
  rawRowCount: number;
  parsedRowCount: number;
}

/** OCR extraction result */
export interface OCRResult {
  text: string;
  confidence: number;
  holdings: ImportHolding[];
}

/** Import preview state */
export interface ImportPreviewState {
  holdings: ImportHolding[];
  validCount: number;
  errorCount: number;
  totalValue: number;
}

/** Import modal props */
export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (holdings: ImportHolding[]) => Promise<void>;
}

/** Tab component common props */
export interface ImportTabProps {
  onDataExtracted: (holdings: ImportHolding[]) => void;
  onValidationError: (errors: string[]) => void;
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ImportModal                              │
│  ┌─────────┬──────────┬───────────┬─────────────────────────┐   │
│  │ Search  │  Manual  │   Excel   │          OCR            │   │
│  │   Tab   │   Tab    │    Tab    │         Tab             │   │
│  └────┬────┴────┬─────┴─────┬─────┴────────────┬────────────┘   │
│       │         │           │                  │                │
│       ▼         ▼           ▼                  ▼                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ImportHolding[] (standardized)              │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   ImportPreview                          │  │
│  │  - Validate data                                         │  │
│  │  - Show preview table                                    │  │
│  │  - Allow edit/delete                                     │  │
│  │  - Display summary stats                                 │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│                             ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Save to Database (Dexie)                    │  │
│  │  - holdingDb.create() for single                         │  │
│  │  - holdingDb.bulkCreate() for batch                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: Foundation (Prerequisites)

#### Task 1: Create Shared Types
**Files:**
- Create: `src/types/import.ts`

**Implementation:**
Create file with all type definitions from "Shared Types" section above.

**Step 1:** Create file with all type definitions
**Step 2:** Export all types from `src/types/index.ts`
**Step 3:** Commit

---

#### Task 2: Create useImport Hook
**Files:**
- Create: `src/hooks/useImport.ts`

**Implementation:**
Hook for managing import state across tabs.

**Step 1:** Create hook with state management
**Step 2:** Add validation logic
**Step 3:** Commit

---

### Phase 2: Tab Components (Can be done in parallel)

#### Task 3: Create SearchTab Component
**Files:**
- Create: `src/components/import/SearchTab.tsx`

**Implementation:**
Reuse logic from `add-holding-modal.tsx`:
- Copy search input and debounced search logic
- Copy search results display
- On fund selection, show form for shares/cost/channel
- Output: `ImportHolding[]` with single item

**Step 1:** Copy search logic from existing modal
**Step 2:** Adapt to output ImportHolding format
**Step 3:** Add form validation
**Step 4:** Commit

---

#### Task 4: Create ManualTab Component
**Files:**
- Create: `src/components/import/ManualTab.tsx`

**Implementation:**
Direct form input for all fields:
- Fund code (6 digits, validated)
- Fund name (text)
- Fund type (select: STOCK/BOND/MIX/INDEX/QDII/FOF/MONEY)
- Shares (number)
- Average cost (number)
- Channel (select)
- Group (text, optional)

**Step 1:** Create form with all fields
**Step 2:** Add validation (fund code 6 digits, positive numbers)
**Step 3:** Commit

---

#### Task 5: Create Excel Parser Utilities
**Files:**
- Create: `src/lib/import/excel-parsers.ts`

**Implementation:**
Parse Excel files from different sources (Alipay, WeChat, Ant Fortune).

**Step 1:** Create parser with XLSX integration
**Step 2:** Implement Alipay format parser
**Step 3:** Add unit tests for parsers
**Step 4:** Commit

---

#### Task 6: Create ExcelTab Component
**Files:**
- Create: `src/components/import/ExcelTab.tsx`

**Implementation:**
- File upload with drag-and-drop
- Parse uploaded file using excel-parsers
- Show preview of detected format
- Display row count and validation errors
- Output: `ImportHolding[]`

**Step 1:** Create file upload UI
**Step 2:** Integrate excel-parsers
**Step 3:** Add format detection display
**Step 4:** Commit

---

#### Task 7: Create OCR Service
**Files:**
- Create: `src/lib/import/ocr-service.ts`

**Implementation:**
Tesseract.js wrapper for client-side OCR.

**Step 1:** Create Tesseract.js wrapper
**Step 2:** Add image preprocessing (optional)
**Step 3:** Add progress callbacks
**Step 4:** Commit

---

#### Task 8: Create Fund Extractor
**Files:**
- Create: `src/lib/import/fund-extractor.ts`

**Implementation:**
Extract fund data from OCR text using regex patterns.

**Step 1:** Create regex patterns for fund code extraction (6 digits)
**Step 2:** Create patterns for shares/amount extraction
**Step 3:** Create patterns for fund name extraction
**Step 4:** Commit

---

#### Task 9: Create OCRTab Component
**Files:**
- Create: `src/components/import/OCRTab.tsx`

**Implementation:**
- Image upload with preview
- OCR processing with progress indicator
- Extracted text display
- Parsed fund data preview
- Manual correction interface
- Output: `ImportHolding[]`

**Step 1:** Create image upload UI
**Step 2:** Integrate OCR service
**Step 3:** Add fund extraction and preview
**Step 4:** Commit

---

### Phase 3: Integration

#### Task 10: Create ImportPreview Component
**Files:**
- Create: `src/components/import/ImportPreview.tsx`

**Implementation:**
- Table display of all holdings
- Inline editing for corrections
- Delete row functionality
- Validation error display
- Summary statistics (total count, valid count, error count, total value)
- Confirm import button

**Step 1:** Create preview table
**Step 2:** Add inline editing
**Step 3:** Add validation display
**Step 4:** Commit

---

#### Task 11: Create ImportModal Container
**Files:**
- Create: `src/components/import/ImportModal.tsx`

**Implementation:**
- Radix UI Tabs for 4 import methods
- useImport hook for state management
- ImportPreview for data validation
- Save to database on confirm
- Reset state on close

**Step 1:** Create modal with tabs
**Step 2:** Integrate all tab components
**Step 3:** Add ImportPreview integration
**Step 4:** Add database save logic
**Step 5:** Commit

---

#### Task 12: Add Import Functionality to Main Page
**Files:**
- Modify: `src/app/page.tsx`

**Implementation:**
- Add "Import Holdings" button
- Integrate ImportModal
- Refresh portfolio data after import

**Step 1:** Add import button to UI
**Step 2:** Integrate ImportModal
**Step 3:** Add refresh callback
**Step 4:** Commit

---

### Phase 4: Testing

#### Task 13: Test All Import Methods
**Test Cases:**
1. Search Tab: Search fund, enter shares/cost, verify saved correctly
2. Manual Tab: Enter all fields manually, verify validation
3. Excel Tab: Upload Alipay/WeChat/Ant formats, verify parsing
4. OCR Tab: Upload screenshot, verify text extraction and fund parsing
5. Preview: Test edit/delete functionality
6. Edge Cases: Empty files, invalid images, malformed data

**Step 1:** Test Search tab
**Step 2:** Test Manual tab
**Step 3:** Test Excel tab with sample files
**Step 4:** Test OCR tab with sample images
**Step 5:** Test preview and edit functionality
**Step 6:** Commit

---

## Parallelization Opportunities

### Can be done in parallel (Phase 2):
- Task 3 (SearchTab) + Task 4 (ManualTab) - Independent tab components
- Task 5 (Excel parsers) + Task 7 (OCR service) - Independent utilities
- Task 6 (ExcelTab) depends on Task 5
- Task 8 (Fund extractor) + Task 9 (OCRTab) depend on Task 7

### Recommended parallel execution:
**Group A:** Tasks 3, 4 (Simple tab components)
**Group B:** Tasks 5, 6 (Excel functionality)
**Group C:** Tasks 7, 8, 9 (OCR functionality)

---

## Dependencies Summary

```
Task 1 (Types) → All other tasks
Task 2 (useImport) → Tasks 3, 4, 6, 9, 11
Task 5 (Excel parsers) → Task 6
Task 7 (OCR service) → Tasks 8, 9
Task 10 (ImportPreview) → Task 11
Tasks 3, 4, 6, 9, 10 → Task 11
Task 11 → Task 12
```

---

## Notes

1. **Baidu OCR API**: The plan mentions Baidu OCR as cloud option, but we'll start with Tesseract.js (client-side) for privacy and cost. Baidu can be added later as fallback.

2. **Excel Formats**: Start with Alipay format as primary, add WeChat and Ant Fortune based on user feedback.

3. **Validation**: All fund codes should be validated as 6 digits. Shares and cost must be positive numbers.

4. **Error Handling**: Each tab should handle errors gracefully and display user-friendly messages.

5. **Performance**: For large Excel files, consider pagination in preview. For OCR, show progress indicator.
