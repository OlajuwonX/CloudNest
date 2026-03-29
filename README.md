# CloudNest

CloudNest is a production-grade private cloud vault for iOS and Android, built with React Native and Expo. Upload, organise, preview, and share your files from anywhere — with real-time storage analytics, offline access, and a native-quality UX that feels right at home alongside apps like Dropbox and Google Drive.

---

## Screenshots & Feature Overview

| Home — Storage Analytics | File Browser | File Preview |
|---|---|---|
| Interactive donut chart, per-category breakdown | Grid / list toggle, infinite scroll, filter + sort | Full-screen image zoom, video playback |

---

## Implemented Features

### Authentication
- Email + password sign-up and login via Appwrite Auth
- Persistent session with Zustand + SecureStore
- Auth-gated navigation using Expo Router protected routes
- Short-lived JWT tokens for authenticated media URLs (auto-refreshed)

### File Management
- Upload photos, videos, PDFs and other documents from device library or file picker
- Categorised automatically on upload (`image`, `video`, `document`, `other`)
- Infinite-scroll paginated file list (`useInfiniteQuery` with cursor-based pagination)
- Grid and list view toggle, persisted per session
- Filter by category and sort by newest, oldest, largest, or name
- Active filters displayed as dismissible pill chips

### File Actions (Context Menu)
- Long-press or tap `⋮` on any file to open a floating context menu
- Menu anchors near the tapped element — smart above/below positioning, never clips off screen
- Blurred backdrop (`expo-blur`) with spring-animated card, Telegram / Apple Music style
- Actions available:
  - **View / Play / Open** — opens the full-screen preview
  - **Download** — saves to device Documents folder and opens the system share sheet
  - **Copy Link** — generates a signed 15-minute JWT URL and copies to clipboard
  - **Share via Email** — downloads the file and opens the native mail composer with attachment
  - **Rename** — in-place rename via modal, synced to Appwrite
  - **File Details** — shows metadata modal (size, type, upload date)
  - **Delete** — two-step confirmation alert, removes from storage bucket and database

### Full-Screen File Preview
- Zoomable pinch-to-zoom image viewer
- Native video player with custom play/pause overlay, fullscreen support
- PDF and document rendering
- File cached locally on first view for instant reopening
- Share menu directly from the preview screen (native share sheet, copy link, email)

### Offline Caching
- Files are silently cached to device on first view (`expo-file-system` cache directory)
- Cached files are served from disk — no network needed on subsequent opens
- 7-day automatic expiry with purge on app launch
- Cache badge indicator (green checkmark) on file cards
- Cache size + file count visible in Profile → Settings
- One-tap "Clear Cache" with confirmation in Profile

### Storage Analytics Dashboard
- Interactive donut chart on Home screen (`react-native-gifted-charts`)
- Segments for Images, Videos, Documents, and Others — colour-coded
- Tap a segment to pop open a drill-down modal showing the 5 largest files in that category
- Real data pulled live from Appwrite — no mocks
- Focused segment expands outward (3D Highcharts-style) via `extraRadius` + `focusOnPress`
- Pie chart wrapped in rounded card with subtle background
- Used / total storage displayed below the chart

### Search
- Full-text search across all files (client-side, capped at 200 for performance)
- Real-time results as you type
- Navigates directly to the file detail screen

### Profile & Settings
- Display name and avatar (initials-based)
- Offline cache management (size, count, clear)
- Sign-out with session invalidation

---

## Tech Stack

### Core
| Library | Purpose |
|---|---|
| React Native + Expo 54 | Cross-platform mobile framework |
| TypeScript | Type safety across the whole codebase |
| Expo Router (file-based) | Navigation — tabs, protected routes, deep links |
| NativeWind v4 (Tailwind CSS) | Utility-first styling |

### Backend
| Library | Purpose |
|---|---|
| Appwrite | Auth, database, file storage bucket |
| `react-native-appwrite` | Appwrite SDK for React Native |

### State & Data Fetching
| Library | Purpose |
|---|---|
| Zustand | Global auth state |
| `@tanstack/react-query` v5 | Server state, caching, `useInfiniteQuery` for paginated lists |
| `@react-native-async-storage` | Offline cache index persistence |

### UI & Animation
| Library | Purpose |
|---|---|
| `react-native-reanimated` v4 | Spring + timing animations (context menu, transitions) |
| `react-native-gesture-handler` | Pinch-to-zoom, swipe gestures |
| `expo-blur` | BlurView for context menu backdrop |
| `expo-haptics` | Haptic feedback on long-press and menu interactions |
| `expo-image` | Optimised image rendering with authenticated URL support |
| `react-native-gifted-charts` | Donut / pie chart for storage analytics |
| `expo-linear-gradient` | Gradient accents |
| `@shopify/flash-list` | Performant virtualised list for large file collections |
| `@backpackapp-io/react-native-toast` | Toast notifications |

### File & Media
| Library | Purpose |
|---|---|
| `expo-file-system` (Next API) | File download, local cache, `File`, `Paths` |
| `expo-av` | Video playback |
| `expo-image-picker` | Photo / video upload from device library |
| `expo-document-picker` | Document upload |
| `expo-sharing` | Native OS share sheet |
| `expo-clipboard` | Copy link to clipboard |
| `expo-mail-composer` | Share file via email with attachment |

---

## Project Structure

```
app/
  (auth)/           → Login, sign-up screens
  (protected)/
    (tabs)/
      home.tsx      → Dashboard — storage analytics + recent files
      files.tsx     → Full file browser — infinite scroll, filter, grid/list
      upload.tsx    → Upload flow
      profile.tsx   → Settings, cache management, sign-out
    file/[id].tsx   → Full-screen file preview

components/
  FileCard.tsx             → List + grid card with thumbnail, cache badge
  FileActionMenu.tsx       → Floating context menu (Telegram-style)
  StorageAnalyticsCard.tsx → Donut chart storage widget
  FileDetailsModal.tsx     → File metadata modal
  FilterSheet.tsx          → Category + sort filter bottom sheet
  RenameModal.tsx          → Rename input modal

lib/
  appwrite.ts   → Appwrite client, account, databases, storage
  queries.ts    → React Query query functions + key factory
  cache.ts      → Offline file cache (download, read, purge, size)
  utils.ts      → formatFileSize, formatDate, formatCurrentDate

stores/
  authStore.ts  → Zustand auth store (user, setUser, clear)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- An [Appwrite](https://appwrite.io) project with:
  - Auth enabled
  - A database with a `files` collection
  - A storage bucket

### Environment Variables

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID=your_collection_id
EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id
```

### Install & Run

```bash
git clone https://github.com/OlajuwonX/CloudNest.git
cd CloudNest
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS / Android) or press `i` / `a` for simulator.

---

## Roadmap — What's Next

### High Priority
- [ ] **Biometric vault lock** — Face ID / fingerprint re-authentication before accessing the app (`expo-local-authentication` is already installed)
- [ ] **Folder / album organisation** — Group files into named folders, drag to move
- [ ] **Bulk selection** — Long-press to enter selection mode, delete or download multiple files at once
- [ ] **Push notifications** — Notify when a large upload completes in the background

### Storage & Performance
- [ ] **Background upload** — Continue uploads when the app is backgrounded (`expo-background-fetch` + `expo-task-manager`)
- [ ] **Upload progress indicator** — Per-file progress bar during upload
- [ ] **Auto-backup toggle** — Automatically back up Camera Roll new photos

### Sharing & Collaboration
- [ ] **Shared links with expiry control** — Choose 1h / 24h / 7d / no expiry when copying a link
- [ ] **Share to another CloudNest user** — Grant read access to a specific account
- [ ] **Public gallery links** — Share a read-only album URL

### Security
- [ ] **Client-side encryption** — Encrypt file bytes on device before upload; decrypt on download (`react-native-quick-crypto` is already installed)
- [ ] **Audit log** — View a history of file access and share events
- [ ] **Two-factor authentication**

### UX Polish
- [ ] **Drag-to-reorder** files within a folder
- [ ] **Swipe-to-delete** on list rows
- [ ] **Animated upload FAB** — Pulsing upload button with upload count badge
- [ ] **Dark mode** — Full dark theme with NativeWind dark: variants
- [ ] **Onboarding flow** — First-launch walkthrough with storage permission requests

---

## Contributing

Pull requests are welcome. For major changes please open an issue first to discuss what you'd like to change.

---

## License

MIT
