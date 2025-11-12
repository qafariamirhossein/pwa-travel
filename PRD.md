## 🧭 Travel Companion PWA – PRD for Cursor IDE

### 1. Project Summary

Build a **Progressive Web App (PWA)** called **NomadNote** — a travel companion tool for planning, organizing, and managing trips.
The app must be **installable**, work **offline**, and **sync data when back online**.

Core modules:

* Trip management
* Itinerary builder
* Expense tracker
* Offline map and notes
* PWA features (installable, service worker, offline caching)

---

### 2. Tech Stack

**Frontend:**

* React + Vite + TypeScript
* Tailwind CSS + ShadCN UI for styling
* Framer Motion for animations

**Offline & PWA:**

* Workbox for service worker setup
* IndexedDB (via localForage) for offline data
* Manifest.json for installability

**Backend:**

* Supabase (auth, storage, and database)
* Optional: REST endpoints for syncing data

**Maps & Geolocation:**

* Leaflet or Mapbox API (with offline tile caching)

**Notifications:**

* Firebase Cloud Messaging or OneSignal (optional phase)

---

### 3. Core Features (MVP)

#### 🗓️ Trip Management

* Create, edit, and delete trips
* Each trip has:

  * Name
  * Destination
  * Date range
  * Optional cover photo

#### 📅 Itinerary Builder

* Add daily activities with time, title, location, and notes
* Drag and drop to reorder items
* Local caching for offline access

#### 💰 Expense Tracker

* Add expenses by category (food, transport, lodging, etc.)
* Show total spent and remaining budget per trip
* Simple pie or bar chart visualization

#### 🗺️ Map View

* Display interactive map (Leaflet or Mapbox)
* Add and save favorite places
* Cache map tiles for offline viewing

#### 🧾 Notes

* Markdown or rich-text notes for each day/trip
* Offline access and sync when online

#### ⚙️ PWA Features

* Add to Home Screen (manifest + icons)
* Service worker caching for assets and API responses
* Offline-first experience (IndexedDB + background sync)

---

### 4. Optional (Post-MVP)

* Push notifications for trip reminders
* Export itinerary as PDF or shareable link
* AI travel suggestions (e.g., GPT API integration)
* Multi-user collaboration

---

### 5. Pages / Routes

| Route            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `/`              | Dashboard — list of trips                                 |
| `/trip/:id`      | Trip details with tabs (Itinerary / Map / Budget / Notes) |
| `/trip/:id/edit` | Trip editor                                               |
| `/new-trip`      | Create trip form                                          |
| `/settings`      | App settings, theme toggle, PWA install guide             |

---

### 6. Data Models

**Trip**

```ts
{
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  createdAt: string;
  updatedAt: string;
}
```

**ItineraryItem**

```ts
{
  id: string;
  tripId: string;
  date: string;
  time?: string;
  title: string;
  location?: string;
  notes?: string;
  order: number;
}
```

**Expense**

```ts
{
  id: string;
  tripId: string;
  category: string;
  amount: number;
  currency: string;
  note?: string;
  createdAt: string;
}
```

**Note**

```ts
{
  id: string;
  tripId: string;
  date?: string;
  content: string;
  updatedAt: string;
}
```

---

### 7. Offline & Sync Behavior

* Store all trip, itinerary, expense, and note data in **IndexedDB**.
* When online:

  * Sync with Supabase backend (two-way merge).
* When offline:

  * Use cached data instantly.
  * Queue unsynced changes.
* On reconnect:

  * Run background sync to update server and local store.

---

### 8. UI/UX Guidelines

* **Theme:** Minimal, modern travel vibe (soft gradients, rounded cards).
* **Navigation:** Bottom tab bar → Trips / Map / Budget / Notes / Settings.
* **Animations:** Smooth transitions using Framer Motion.
* **Dark mode:** Supported via Tailwind’s `dark:` classes.
* **Responsiveness:** Mobile-first layout, tablet & desktop adaptive.

---

### 9. Milestones

| Phase   | Deliverables                             | Estimated Time |
| ------- | ---------------------------------------- | -------------- |
| Phase 1 | Project setup + PWA boilerplate          | 1 day          |
| Phase 2 | Trip & Itinerary CRUD (local + Supabase) | 2 days         |
| Phase 3 | Expense Tracker                          | 1 day          |
| Phase 4 | Offline caching & sync logic             | 2 days         |
| Phase 5 | Map integration                          | 2 days         |
| Phase 6 | UI polish + testing + animations         | 1 day          |

---

### 10. Acceptance Criteria

* ✅ App installable via PWA manifest
* ✅ Works offline (view trips + itineraries + notes)
* ✅ Data syncs automatically when reconnected
* ✅ Responsive and mobile-friendly
* ✅ Lighthouse PWA score ≥ 90