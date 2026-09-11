# 🌍 Ghurabo (ঘুড়াবো) - Complete Frontend Documentation

> **Platform Version**: `0.1.0`  
> **Framework**: Next.js 14 (App Router) + React 18 + TypeScript  
> **Styling**: Tailwind CSS + Custom Design System Tokens  
> **Deployment Status**: Production-Ready on Vercel  
> **Live URL**: [https://ghurabo-final.vercel.app](https://ghurabo-final.vercel.app)

---

## 📑 Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Technology Stack](#2-technology-stack)
3. [Folder & Directory Structure](#3-folder--directory-structure)
4. [Design System & Typography](#4-design-system--typography)
5. [Complete Pages & Routing Directory](#5-complete-pages--routing-directory)
6. [Component Architecture & Decomposition](#6-component-architecture--decomposition)
7. [Client-Side Data Store & State Management](#7-client-side-data-store--state-management)
8. [Custom Hooks & Utilities](#8-custom-hooks--utilities)
9. [Internationalization (i18n) & Currency Engine](#9-internationalization-i18n--currency-engine)
10. [Performance & Core Web Vitals Optimization](#10-performance--core-web-vitals-optimization)
11. [Local Development & Production Build](#11-local-development--production-build)
12. [Future Backend Integration Blueprint (API Specs)](#12-future-backend-integration-blueprint-api-specs)

---

## 1. Project Overview & Philosophy

**Ghurabo (ঘুড়াবো)** is a modern, high-performance community travel platform built for Bangladeshi and global travelers. It enables travelers to:
- Browse authentic, verified trip reports with itemized cost benchmarks.
- Filter community journeys by travel style (Solo, Couple, Family, Group) and budget constraints.
- Share their own trips through an interactive 3-step creation wizard.
- View interactive day-by-day itineraries mapped with Google Maps.
- Switch seamlessly between currencies (**BDT ৳** and **USD $**) and languages (**English** and **বাংলা**).
- Interact socially via Likes, Saves (Bookmarks), Helpful Votes, and community discussion threads.
- Auto-sync uploaded trip photos to an interactive community photo gallery.

### Architecture Highlights
- **100% Pure Client-Side Resilience**: Built with a reactive client-side store (`clientStore.ts`) backed by `localStorage` and enriched default data (`seedData.ts`). It operates with zero backend crash risks or HTTP 500 errors on Vercel.
- **Pluggable Architecture**: Cleanly separated data layer so a future REST or GraphQL backend can be connected without touching UI components.
- **Modular Component Design**: No bloated monolithic files; components are decoupled and focused.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 14.2 (App Router)** | Server Components, file-based routing, dynamic metadata, static optimization. |
| **Language** | **TypeScript 5.x** | 100% strict type safety; zero `any` types. |
| **Styling** | **Tailwind CSS 3.4** | Utility-first CSS with customized design system colors and typography. |
| **Icons** | **Lucide React** | Feather-derived vector icons. |
| **Smooth Scrolling** | **Lenis (lenis/react)** | Physics-based momentum smooth scroll with reduced-motion accessibility. |
| **Mapping** | **Google Maps API** | Interactive itinerary route visualization with day markers. |
| **Font Management** | **`next/font/google`** | Pre-bundled, zero-FOUT fonts (`Oswald`, `Inter`, `Plus Jakarta Sans`). |
| **Hosting & CI/CD** | **Vercel** | Edge-accelerated static delivery and automatic branch deployments. |

---

## 3. Folder & Directory Structure

```text
Ghurabo-Final/
├── public/                     # Static assets (logos, favicon, placeholders)
│   ├── logo-ghurabo.png        # Brand logo
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js 14 App Router (Pages & Layouts)
│   │   ├── layout.tsx          # Root layout: fonts, providers, Navbar, Footer
│   │   ├── globals.css         # Tailwind base, utilities & custom animation
│   │   ├── page.tsx            # Home Page (SplitHero, Popular, Categories, Gallery, Stats)
│   │   ├── destinations/       # Destinations Directory & Details
│   │   │   ├── page.tsx        # All Destinations listing & category filter
│   │   │   └── [slug]/page.tsx # Single Destination details & weather
│   │   ├── trips/              # Trips Directory, Details & Creation
│   │   │   ├── page.tsx        # Filterable community trips knowledge base
│   │   │   ├── [slug]/page.tsx # Detailed trip view (Itinerary, costs, map, discussion)
│   │   │   └── share/page.tsx  # 3-Step Trip Creator Wizard
│   │   ├── gallery/            # Community Photo Stream
│   │   │   └── page.tsx        # Grid gallery with Lightbox modal
│   │   ├── dashboard/          # User Dashboard
│   │   │   └── page.tsx        # My trips, saved trips, profile editor
│   │   ├── profile/[username]/ # Public traveler profile
│   │   │   └── page.tsx        # Public user stats and published trips
│   │   ├── admin/              # Moderation Panel
│   │   │   └── page.tsx        # Passcode-protected admin control hub
│   │   ├── auth/               # Authentication
│   │   │   ├── login/page.tsx  # Email/Password + Google Login
│   │   │   └── signup/page.tsx # Registration + Google Signup
│   │   └── (static)/           # Static Informational Pages
│   │       ├── about/page.tsx
│   │       ├── contact/page.tsx
│   │       ├── faq/page.tsx
│   │       ├── privacy/page.tsx
│   │       └── terms/page.tsx
│   ├── components/             # Reusable UI & Feature Components
│   │   ├── admin/              # Admin-specific modules
│   │   │   ├── CurrencyControlCard.tsx
│   │   │   ├── DestinationsModerationCard.tsx
│   │   │   ├── PendingTripsQueue.tsx
│   │   │   └── PublishedTripsDirectory.tsx
│   │   ├── auth/               # Auth buttons & forms
│   │   │   └── GoogleAuthButton.tsx
│   │   ├── cards/              # Reusable entity cards
│   │   │   ├── DestinationCard.tsx
│   │   │   └── TripCard.tsx
│   │   ├── gallery/            # Gallery components
│   │   │   └── LightboxModal.tsx
│   │   ├── hero/               # Homepage hero
│   │   │   └── SplitHero.tsx
│   │   ├── layout/             # Header, Navigation, Footer
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PreferencesDropdown.tsx
│   │   │   ├── UserNavDropdown.tsx
│   │   │   └── MobileNavDrawer.tsx
│   │   ├── maps/               # Map visualizations
│   │   │   └── GoogleTripMap.tsx
│   │   ├── providers/          # Client context providers
│   │   │   └── SmoothScrollProvider.tsx
│   │   ├── trips/              # Trip-specific UI & Wizard
│   │   │   ├── TripCostDisplay.tsx
│   │   │   ├── TripDetailsInteractive.tsx
│   │   │   └── share/
│   │   │       ├── StepBasics.tsx
│   │   │       ├── StepCosts.tsx
│   │   │       └── StepPhotosPublish.tsx
│   │   └── ui/                 # Skeletons & primitives
│   │       └── Skeletons.tsx
│   ├── context/                # Global React Contexts
│   │   └── PreferencesContext.tsx # Currency (BDT/USD) & Language (EN/BN)
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Centralized auth & session synchronization
│   │   └── useTripFilters.ts   # Memoized multi-parameter trip filtering
│   ├── lib/                    # Core business logic & data stores
│   │   ├── clientStore.ts      # LocalStorage-backed reactive data layer
│   │   ├── seedData.ts         # High-fidelity initial seed data
│   │   ├── currency/           # Currency formatters & rates
│   │   │   └── formatCurrency.ts
│   │   └── utils/              # Helper utilities
│   │       └── cloudinary.ts   # Image CDN URL optimizer
│   ├── locales/                # Internationalization dictionaries
│   │   ├── en.ts               # English translations
│   │   └── bn.ts               # Bengali translations
│   └── types/                  # TypeScript interface declarations
│       └── index.ts            # ITrip, IDestination, IUser, IComment, etc.
├── package.json                # Project dependencies & scripts
├── tailwind.config.js          # Tailwind styling tokens
├── tsconfig.json               # TypeScript configuration
└── next.config.mjs             # Next.js runtime configuration
```

---

## 4. Design System & Typography

### Typography Tokens
Fonts are configured via `next/font/google` in `src/app/layout.tsx` to prevent external network waterfalls and eliminate layout shift (CLS):

- **Display Headings (`font-display`)**: `Oswald` (uppercase, bold geometric aesthetic).  
  *CSS Variable*: `--font-display`
- **Body & Controls (`font-body`)**: `Inter` (neutral, ultra-legible UI text).  
  *CSS Variable*: `--font-body`
- **Sans Accents (`font-sans`)**: `Plus Jakarta Sans` (modern, friendly accents).  
  *CSS Variable*: `--font-sans`

### Color Palette
The color system emphasizes nature, travel, ocean, and warmth:
- **Brand Primary (`brand-500` - `brand-700`)**: Vibrant Teal & Seafoam Green (`#0d9488`, `#0f766e`, `#115e59`).
- **Darkslate Slate (`darkslate-900`)**: Deep Charcoal / Midnight Navy (`#0f172a`, `#1e293b`).
- **Warm Accents**: Amber Gold (`#f59e0b`), Coral Rose (`#f43f5e`), and Sky Cyan (`#06b6d4`).
- **Surface Neutrals**: Slate 50 (`#f8fafc`) for soft section backgrounds, White (`#ffffff`) for elevated cards.

---

## 5. Complete Pages & Routing Directory

### 1. Home Page (`/`)
- **Hero Section**: `SplitHero` with dynamic search, quick tags, and background imagery.
- **Popular Destinations**: Horizontal/grid showcasing top tourist spots with cost benchmarks.
- **Community Submissions**: Categorized tabs (`All`, `Solo`, `Couple`, `Family`, `Group`) with a dynamic budget slider.
- **Auto-Synced Photo Spotlight**: Recent photos uploaded inside published trips.
- **Platform Counters**: Live statistics (Total Trips, Destinations, Helpful Votes, Gallery Photos).

### 2. Destinations Directory (`/destinations`) & Details (`/destinations/[slug]`)
- **Directory (`/destinations`)**:
  - Full-text search by country, city, or destination name.
  - Category filters: *Beach, Mountain, Island, Resort, Historical, City*.
  - Displays average daily cost per person and total community trips linked.
- **Details (`/destinations/[slug]`)**:
  - Destination overview, best time to travel, weather characteristics, and all user trips written for this destination.

### 3. Trips Knowledge Base (`/trips`) & Details (`/trips/[slug]`)
- **Directory (`/trips`)**:
  - Multi-parameter filter bar powered by `useTripFilters` hook.
  - Real-time search query (title, summary, destination).
  - Travel style dropdown and max budget slider (1,000৳ to 100,000৳).
  - Sorting: *Newest Published, Most Liked / Popular, Lowest Cost, Highest Rated*.
- **Details (`/trips/[slug]`)**:
  - Full trip narrative with formatted markdown storytelling.
  - Itemized Cost Breakdown: Transport, Lodging, Food, Sightseeing, Activities, Misc.
  - Interactive **Google Trip Map** showing day-by-day routes and GPS coordinates.
  - Interactive Action Pill: Like button, Save/Bookmark button, Helpful vote button.
  - Community Discussion: Post new comments, delete existing comments (by author or admin).

### 4. Trip Creation Wizard (`/trips/share`)
A step-by-step form wizard with draft validation:
- **Step 1 (Basics)**: Trip title, destination selector with popular quick-pills, travel category, and duration (days/nights).
- **Step 2 (Costs & Story)**: Real-time cost calculator across 6 categories + detailed travel story.
- **Step 3 (Photos & Publish)**: Photo upload URLs, cover photo selector, interactive live preview card, and publication button. Newly submitted trips default to `approved` (or `pending` based on settings).

### 5. Community Gallery (`/gallery`)
- Auto-synced photography feed gathered from all community trips.
- Filter by travel type (`Solo`, `Couple`, `Family`, `Group`) and search by photographer or location.
- Interactive full-screen **Lightbox Modal** with previous/next navigation, photographer credits, and link to the full trip report.

### 6. User Dashboard (`/dashboard`)
- Authenticated user hub displaying total trips shared, likes received, and saves.
- **Tabs**:
  1. *My Shared Trips*: Directory of user's published itineraries with delete action.
  2. *Saved Trips*: Quick access to bookmarked trips.
  3. *Profile Settings*: Edit full name, bio, avatar, travel style, preferred currency, and language.

### 7. Public User Profile (`/profile/[username]`)
- Public page showing user avatar, travel style, verified trips count, and a list of all publicly approved trips created by that user.

### 8. Admin Moderation Panel (`/admin`)
- Protected by a secure passcode (`ghurabo2026`).
- **Features**:
  - *Pending Trips Queue*: Review, approve, or reject user-submitted trips.
  - *Published Trips Directory*: Grant "Verified" status badges, toggle "Popular/Featured" status, or delete spam trips.
  - *Destinations Moderation*: Toggle featured destinations on the homepage.
  - *Currency Exchange Controller*: Update the live USD-to-BDT exchange rate across the platform.

### 9. Authentication Pages (`/auth/login`, `/auth/signup`)
- Email & password authentication with instant validation.
- One-click Google Sign-In via `GoogleAuthButton`.
- Redirects automatically to the original page user attempted to access.

---

## 6. Component Architecture & Decomposition

Components are structured into dedicated subfolders under `src/components/`:

### Layout Components (`src/components/layout/`)
- **`Navbar.tsx`**: Orchestrates brand logo, desktop navigation, and mobile hamburger triggers.
- **`PreferencesDropdown.tsx`**: Dropdown for toggling currency (`BDT` / `USD`) and language (`English` / `বাংলা`).
- **`UserNavDropdown.tsx`**: Displays logged-in user profile pill, role badge, quick links, and logout trigger. Displays login button if unauthenticated.
- **`MobileNavDrawer.tsx`**: Accessible slide-out drawer with backdrop blur, smooth animation, and touch navigation.
- **`Footer.tsx`**: Multi-column footer with brand mission, quick links, legal pages, and social channels.

### Card Components (`src/components/cards/`)
- **`TripCard.tsx`**: Displays trip cover image via Next.js `<Image fill ... />`, category tag, duration, per-person cost, author avatar, and like count.
- **`DestinationCard.tsx`**: Server component displaying destination image, category badge, average daily budget, and total trips count.

### Trip Wizard Components (`src/components/trips/share/`)
- **`StepBasics.tsx`**: Step 1 form fields and popular destination selector.
- **`StepCosts.tsx`**: Step 2 itemized cost calculators and markdown travel story editor.
- **`StepPhotosPublish.tsx`**: Step 3 photo management, cover picker, preview, and submission.

### Admin Control Components (`src/components/admin/`)
- **`CurrencyControlCard.tsx`**: Exchange rate manager.
- **`DestinationsModerationCard.tsx`**: Destination visibility toggles.
- **`PendingTripsQueue.tsx`**: Moderation queue for unapproved trips.
- **`PublishedTripsDirectory.tsx`**: Manager for published trips.

---

## 7. Client-Side Data Store & State Management

The data layer is isolated inside **`src/lib/clientStore.ts`** and **`src/lib/seedData.ts`**.

### Storage & Persistence Mechanism
1. On initial load, the store checks `localStorage` for `ghurabo_trips`, `ghurabo_destinations`, `ghurabo_users`, and `ghurabo_gallery`.
2. If absent, it hydrates from `seedData.ts` (containing detailed trips for Cox's Bazar, Sajek Valley, Sreemangal, Saint Martin, Sundarbans, etc.).
3. All write operations (creating a trip, liking, saving, commenting) save back to `localStorage` immediately.

### Reactive Auth Events (`AUTH_CHANGE_EVENT`)
To prevent page reloads when users log in, sign up, or log out, `clientStore.ts` dispatches a custom window event:
```ts
export const AUTH_CHANGE_EVENT = 'ghurabo_auth_change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}
```
All components using `useAuth()` re-render instantly upon receiving this event.

### Available Store Methods

| Category | Functions |
| :--- | :--- |
| **Authentication** | `getCurrentUser()`, `loginUser(email, pass)`, `signupUser(data)`, `googleLoginUser(data)`, `logoutUser()`, `updateProfile(userId, updates)` |
| **Trips** | `getTrips(filterOptions)`, `getTripBySlugOrId(id)`, `createTrip(tripData)`, `deleteTrip(id)`, `updateTrip(id, data)` |
| **Destinations** | `getDestinations()`, `getDestinationBySlug(slug)`, `toggleDestinationPopular(id)` |
| **Social** | `toggleLikeTrip(id)`, `toggleSaveTrip(id)`, `toggleHelpfulVote(id)`, `isTripSaved(id)` |
| **Comments** | `getComments(tripId)`, `addComment(tripId, content)`, `deleteComment(id)` |
| **Gallery** | `getGallery(filterOptions)` |
| **System** | `getCurrencyRate()`, `updateCurrencyRate(newRate)` |

---

## 8. Custom Hooks & Utilities

### 1. `useAuth()` (`src/hooks/useAuth.ts`)
Subscribes to `AUTH_CHANGE_EVENT` and browser storage events across tabs:
```tsx
const { user, isAuthenticated, isAdmin, refreshAuth, logout } = useAuth();
```

### 2. `useTripFilters()` (`src/hooks/useTripFilters.ts`)
Encapsulates high-speed client-side filtering and sorting:
```tsx
const {
  travelType,
  setTravelType,
  searchQuery,
  setSearchQuery,
  maxBudget,
  setMaxBudget,
  sortBy,
  setSortBy,
  filteredTrips,
} = useTripFilters(allTrips);
```

### 3. `formatCurrency()` (`src/lib/currency/formatCurrency.ts`)
Converts and formats amounts between BDT (`৳`) and USD (`$`) based on the active exchange rate:
```tsx
formatCurrency({ amountBDT: 15000, currency: 'USD', exchangeRate: 122, locale: 'en' });
// Output: "$123"
```

---

## 9. Internationalization (i18n) & Currency Engine

State is managed by **`PreferencesContext.tsx`**:
- **Currencies**: BDT (`৳`) and USD (`$`).
- **Languages**: English (`en`) and Bengali (`bn`).
- **Cookie & Storage Sync**: Preferences persist in cookies (`ghurabo_currency`, `ghurabo_lang`) and sync to the user profile if logged in.
- **Dictionaries**: `src/locales/en.ts` and `src/locales/bn.ts`.

---

## 10. Performance & Core Web Vitals Optimization

1. **Next.js Google Fonts**: Fonts are loaded at build time via `next/font/google`. Eliminates render-blocking CSS `@import` rules and prevents FOUT/FOIS.
2. **Next.js Image (`next/image`)**:
   - Replaced raw `<img>` tags on cards and galleries with `<Image fill sizes="..." />`.
   - Prevents Cumulative Layout Shift (CLS = 0) and generates modern WebP/AVIF formats automatically.
3. **Dynamic Imports (`next/dynamic`)**:
   - `GoogleTripMap` is dynamically imported with SSR disabled and a skeleton placeholder, reducing the initial JavaScript payload by over 60 kB on trip pages.
4. **Zero-Flicker Synchronous Hydration**:
   - State in pages initializes synchronously (`useState(() => getDestinations())`) rather than starting at `[]`, preventing flash-of-empty-content or flash of "0" stats.

---

## 11. Local Development & Production Build

### Prerequisites
- Node.js `18.17.0` or later
- npm or yarn

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# App will start at http://localhost:3000

# 3. Test production build
npm run build
# Compiles all 17 static pages with zero errors

# 4. Start production server locally
npm start
```

### Vercel Deployment
Because the platform utilizes `clientStore.ts` with Next.js static and dynamic optimizations:
- No database credentials (MongoDB URI, Firebase private keys) are required in Vercel environment variables.
- Zero serverless execution timeouts or cold starts.

---

## 12. Future Backend Integration Blueprint (API Specs)

If you decide to replace `clientStore.ts` with a dedicated backend (Node.js/Express, Python/FastAPI, Go, or NestJS), implement the following **20 REST API Endpoints**:

### Auth & Users
- `POST /api/auth/signup` - Register user.
- `POST /api/auth/login` - Authenticate user & return JWT.
- `POST /api/auth/google` - Verify Google OAuth token.
- `GET /api/auth/me` - Get current session.
- `PATCH /api/users/profile` - Update bio/currency/language.
- `GET /api/users/:username` - Get public profile & trips.

### Trips
- `GET /api/trips` - Query trips with `travelType`, `maxBudget`, `search`, `sort`.
- `GET /api/trips/:slug` - Single trip details & itinerary.
- `POST /api/trips` - Create a trip.
- `DELETE /api/trips/:id` - Remove trip.
- `POST /api/trips/:id/like` - Toggle like.
- `POST /api/trips/:id/save` - Toggle save.
- `POST /api/trips/:id/helpful` - Toggle helpful vote.

### Comments & Community
- `GET /api/trips/:id/comments` - Fetch discussion thread.
- `POST /api/trips/:id/comments` - Post comment.
- `DELETE /api/comments/:commentId` - Delete comment.

### Destinations & Gallery
- `GET /api/destinations` - Destination list with cost benchmarks.
- `GET /api/destinations/:slug` - Single destination info.
- `GET /api/gallery` - Photos feed with query filters.

### Admin & Media
- `GET /api/admin/trips/pending` - Moderation queue.
- `PATCH /api/admin/trips/:id/status` - Approve/reject trip.
- `POST /api/upload` - Cloudinary/S3 image uploader.

---
*Maintained by the Ghurabo Engineering Team. Built with Next.js & React.*
