# Offline Features Documentation

## Overview

ChocoLearn is now a Progressive Web App (PWA) with full offline support. Users can study their flashcards anytime, anywhere, even without an internet connection!

## Features Implemented

### 1. Progressive Web App (PWA)
- **Service Worker**: Automatically caches static assets (HTML, CSS, JS, fonts)
- **Installable**: Users can install the app on their devices (mobile/desktop)
- **App Manifest**: Configured with icons, theme colors, and app shortcuts
- **Offline Page**: Always accessible even without internet

### 2. Offline-First Data Storage
- **IndexedDB**: Stores large datasets (card sets, study sessions)
- **LocalStorage**: Stores small state data (preferences, tokens)
- **Pinia Persistence**: Automatic state persistence across sessions

### 3. Intelligent Sync System
- **Operation Queue**: All CRUD operations are queued when offline
- **Auto-Sync**: Automatically syncs when internet connection is restored
- **Conflict Resolution**: Smart merging of local and remote changes
- **Optimistic UI**: Instant UI updates, sync happens in background

### 4. Enhanced Study Experience
- **Offline Study Modes**: All study modes work offline (Learn, Write, Test, Flashcards)
- **Statistics Tracking**: Study progress tracked locally and synced later
- **Sample Data**: Pre-loaded sample card sets for first-time users
- **Smart Caching**: Recently used card sets are always available offline

### 5. User Interface
- **Offline Indicator**: Visual indicator showing online/offline status
- **Pending Changes**: Shows count of changes waiting to sync
- **Sync Status Dialog**: Detailed view of sync progress and history
- **Manual Sync**: Users can trigger sync manually when needed

## Architecture

### Data Flow

```
User Action
    ↓
Pinia Store (optimistic update)
    ↓
IndexedDB (local cache)
    ↓
[Online?] 
    ├─ Yes → API Call → Success → Update cache
    └─ No  → Queue Operation → Wait for online
```

### Storage Strategy

- **Card Sets**: IndexedDB (primary) + LocalStorage (lightweight backup)
- **Statistics**: IndexedDB (primary) + LocalStorage (recent sessions)
- **Auth Tokens**: LocalStorage (encrypted)
- **Pending Operations**: IndexedDB (sync queue)

### Caching Strategy

- **Static Assets**: Cache-first (instant loading)
- **API Calls**: Network-first with cache fallback
- **Images**: Cache-first with 30-day expiration

## Usage

### For Users

1. **Install the App**
   - Visit the website
   - Click "Install" prompt or use browser menu → "Install App"

2. **Study Offline**
   - Open the app (works offline after first visit)
   - All your card sets are available
   - Study as normal - progress is tracked locally

3. **Sync Changes**
   - Changes sync automatically when back online
   - Check sync status in the indicator banner
   - Manual sync available via sync button

### For Developers

#### Running in Development
```bash
pnpm dev
# PWA features are enabled in dev mode
```

#### Building for Production
```bash
pnpm build
# Generates service worker and manifest automatically
```

#### Testing Offline Mode
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Test all features work without network

#### Debugging Service Worker
1. Open DevTools → Application tab
2. Check "Service Workers" section
3. View cached resources in "Cache Storage"
4. View IndexedDB data in "Storage → IndexedDB"

## Configuration

### PWA Configuration (`vite.config.ts`)
```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
    runtimeCaching: [ /* ... */ ]
  }
})
```

### Store Persistence (`stores/*.store.ts`)
```typescript
defineStore('name', () => {
  // ... store logic
}, {
  persist: {
    key: 'store-key',
    storage: localStorage,
    paths: ['selectedPaths']
  }
})
```

## API Endpoints

All API endpoints support offline-first behavior:
- `GET /cardsets` - Cached locally, background refresh
- `POST /cardsets` - Queued when offline, synced later
- `PUT /cardsets/:id` - Optimistic update, queued when offline
- `DELETE /cardsets/:id` - Optimistic delete, queued when offline
- `POST /statistics/sessions` - Queued when offline, synced later

## Conflict Resolution

### Strategy: Last-Write-Wins with Merge
1. **Card Sets**: Merge cards by terminology, keep latest metadata
2. **Statistics**: Sum up counts, keep latest timestamps
3. **Conflicts**: User notified if manual resolution needed

## Browser Support

- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (iOS & macOS)
- ✅ Samsung Internet 14+

## Limitations

- **First Visit**: Requires internet to load app initially
- **Large Datasets**: IndexedDB has ~50MB limit (sufficient for 1000+ card sets)
- **Image Caching**: External images may not load offline
- **Sync Conflicts**: Rare cases may require manual resolution

## Future Enhancements

- [ ] Background Sync API for better sync reliability
- [ ] Push Notifications for study reminders
- [ ] Offline speech synthesis for pronunciation
- [ ] Multi-device sync with conflict detection
- [ ] Export/import data for backup

## Troubleshooting

### App not working offline
1. Check if service worker is registered (DevTools → Application)
2. Clear cache and reload: Settings → Clear Storage
3. Reinstall the app

### Changes not syncing
1. Check network connection
2. View sync status dialog
3. Try manual sync
4. Check pending operations count

### Storage full
1. Delete old/unused card sets
2. Clear browser data
3. App will show warning at 80% capacity

## Support

For issues or questions:
- Check browser console for errors
- View sync status for pending operations
- Report bugs with console logs and network data
