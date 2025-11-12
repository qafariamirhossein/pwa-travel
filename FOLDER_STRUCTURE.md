# NomadNote - Folder Structure

```
pwa-travel/
├── public/                          # Static assets
│   ├── vite.svg                    # Vite logo
│   ├── pwa-192x192.png             # PWA icon (192x192) - REPLACE WITH ACTUAL ICON
│   ├── pwa-512x512.png             # PWA icon (512x512) - REPLACE WITH ACTUAL ICON
│   ├── apple-touch-icon.png        # Apple touch icon - REPLACE WITH ACTUAL ICON
│   └── mask-icon.svg               # Safari mask icon (optional)
│
├── src/
│   ├── components/                 # React components
│   │   ├── ui/                     # ShadCN UI base components
│   │   │   ├── button.tsx          # Button component
│   │   │   ├── card.tsx            # Card components
│   │   │   ├── input.tsx           # Input component
│   │   │   ├── textarea.tsx        # Textarea component
│   │   │   ├── tabs.tsx            # Tabs component
│   │   │   ├── badge.tsx           # Badge component
│   │   │   └── label.tsx           # Label component
│   │   │
│   │   ├── tabs/                   # Feature tab components
│   │   │   ├── ItineraryTab.tsx    # Itinerary management
│   │   │   ├── MapTab.tsx          # Map view with Leaflet
│   │   │   ├── BudgetTab.tsx       # Expense tracker
│   │   │   └── NotesTab.tsx        # Notes with Markdown
│   │   │
│   │   ├── BottomNav.tsx           # Bottom navigation bar
│   │   └── OnlineStatus.tsx        # Online/offline indicator
│   │
│   ├── lib/                         # Utilities and services
│   │   ├── db.ts                   # IndexedDB operations (localForage)
│   │   ├── sync.ts                 # Sync manager for Supabase
│   │   ├── supabase.ts             # Supabase client configuration
│   │   └── utils.ts                # Helper functions (cn, formatDate, etc.)
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── Dashboard.tsx          # Trip list (home page)
│   │   ├── TripDetail.tsx          # Trip detail with tabs
│   │   ├── TripEdit.tsx            # Edit trip form
│   │   ├── NewTrip.tsx             # Create trip form
│   │   └── Settings.tsx            # App settings
│   │
│   ├── store/                      # Zustand state management
│   │   └── useTripStore.ts         # All stores (trips, itinerary, expenses, notes)
│   │
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts                # Trip, ItineraryItem, Expense, Note types
│   │
│   ├── App.tsx                     # Main app component with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles + Tailwind
│
├── .env.example                    # Environment variables template
├── .eslintrc.cjs                   # ESLint configuration
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── README.md                       # Project documentation
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript config for Node
└── vite.config.ts                 # Vite + PWA plugin configuration
```

## Key Files Explained

### Core Application
- `src/App.tsx` - Main app component, sets up routing and sync listeners
- `src/main.tsx` - Entry point, registers service worker
- `src/index.css` - Global styles, Tailwind directives, Leaflet CSS

### State Management
- `src/store/useTripStore.ts` - All Zustand stores:
  - `useTripStore` - Trip CRUD operations
  - `useItineraryStore` - Itinerary items with drag-and-drop
  - `useExpenseStore` - Expense tracking
  - `useNoteStore` - Notes management

### Data Layer
- `src/lib/db.ts` - IndexedDB operations using localForage
- `src/lib/sync.ts` - Sync manager for Supabase integration
- `src/lib/supabase.ts` - Supabase client setup

### UI Components
- `src/components/ui/` - Reusable ShadCN-style components
- `src/components/tabs/` - Feature-specific tab components
- `src/components/BottomNav.tsx` - Mobile bottom navigation
- `src/components/OnlineStatus.tsx` - Network status indicator

### Pages
- `src/pages/Dashboard.tsx` - Trip list/grid view
- `src/pages/TripDetail.tsx` - Trip detail with tabs for itinerary/map/budget/notes
- `src/pages/NewTrip.tsx` - Create new trip form
- `src/pages/TripEdit.tsx` - Edit trip form
- `src/pages/Settings.tsx` - App settings, theme toggle, PWA install

## Data Flow

1. **User Action** → Component calls store method
2. **Store** → Updates IndexedDB via `db.ts`
3. **Store** → Queues sync if online via `sync.ts`
4. **Sync Manager** → Syncs with Supabase when online
5. **UI** → Reactively updates via Zustand

## Offline-First Architecture

- All data stored in IndexedDB (via localForage)
- Changes queued when offline
- Automatic sync when connection restored
- Works fully offline without Supabase

