# Frontend Development Plan — Social Media App

## Tech Stack
- **Framework:** Angular 18 (Standalone Components)
- **Styling:** Tailwind CSS 3 + SCSS
- **State:** RxJS BehaviorSubjects / Angular Signals (where applicable)
- **HTTP:** Angular HttpClient with interceptors
- **Routing:** Lazy-loaded feature modules
- **Forms:** Angular Reactive Forms

---

## Phase 1: Auth & Layout
- [x] Login page (email + password)
- [x] Register page (username, email, password, confirm password)
- [x] Google OAuth on both login and register
- [x] Facebook OAuth on both login and register
- [x] OAuth callback handler (/auth/oauth-callback)
- [x] Forgot password page
- [x] Reset password page (with token from email)
- [x] JWT token storage and auth interceptor
- [x] Auth guard for protected routes
- [x] Main layout (sidebar nav, top bar, content area)
- [x] Responsive mobile layout (bottom nav)
- [x] Redirect logic (auth → feed, unauth → login)

## Phase 2: User Profile
- [x] Profile page (avatar, bio, stats: posts/followers/following)
- [x] Followers and following are clickable → /profile/:username/followers|following
- [x] Edit profile (links to settings)
- [x] Avatar upload with preview (in settings)
- [x] Follow/unfollow button with optimistic count update
- [x] Followers list page (/profile/:username/followers)
- [x] Following list page (/profile/:username/following)
- [x] Follow/unfollow users from followers/following list
- [x] User's post list with pagination

## Phase 3: Feed & Posts
- [x] Feed page (Feed/Explore tabs, infinite scroll)
- [x] Post card component (avatar, username, content, image, actions)
- [x] Create post composer (modal, text + content)
- [x] Post detail page (full post + threaded comments)
- [x] Like/unlike button with optimistic counter
- [x] Comment section (add, delete, reply to comment)
- [x] Nested reply thread with inline reply input
- [x] Delete own post
- [x] Image display (single and multi-image grid with overflow indicator)
- [x] Hashtag links from post content → /hashtag/:name
- [x] Repost/share with optimistic counter
- [x] Bookmark/save post with optimistic toggle

## Phase 4: Explore & Search
- [x] Search page with debounced input (400ms)
- [x] Search users by name/username
- [x] Hashtag feed page (/hashtag/:name) with post count
- [x] Explore tab in feed (trending posts)

## Phase 5: Messaging
- [x] Conversations list with last message and unread badge
- [x] Chat window (message bubbles, timestamps)
- [x] Send messages (REST + scrolls to bottom)
- [x] Mark conversation as read on open
- [x] WebSocket connected in layout (real-time unread count updates)
- [x] Unread message badge in nav

## Phase 6: Notifications
- [x] Notifications page with paginated list
- [x] Notification item (like, comment, follow, message, mention)
- [x] Mark as read on click (individual)
- [x] Mark all as read button
- [x] Real-time unread badge via WebSocket
- [x] Notification preferences page (/settings/notifications)
- [x] Per-type toggle with optimistic update

## Phase 7: Settings
- [x] Account settings (change email via update, change password)
- [x] Profile settings (bio, avatar, display name)
- [x] Privacy settings (private account toggle)
- [x] Notification preferences (link to /settings/notifications)
- [x] Deactivate account

## Phase 8: Stories, Bookmarks & Reporting
- [x] Stories page (/stories) — feed grouped by user
- [x] View story (records view count)
- [x] Add story with image upload
- [x] Story viewer modal (full screen)
- [x] Bookmarks page (/bookmarks) — saved posts with remove
- [x] Report modal (post reporting with reason selection)
- [x] Report wired to feed, profile, search, bookmarks

## Design Notes
- Mobile-first responsive design
- Tailwind utility classes for rapid UI development
- SCSS for global styles
- Consistent spacing scale (Tailwind defaults)
- Color palette: primary (blue) + neutral grays
- Skeleton loading states on all list pages
- Empty states for no-content scenarios
- Toast notifications for all user actions

---

## Folder Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              → Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── shared/            → Reusable components, directives, pipes
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/          → Lazy-loaded feature areas
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── feed/
│   │   │   ├── profile/
│   │   │   ├── post/
│   │   │   │   ├── create-post/
│   │   │   │   └── post-detail/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── search/
│   │   │   └── settings/
│   │   ├── layouts/           → App shell / layout components
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── environments/
│   └── styles.scss
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Scripts
- `npm start` — Dev server on http://localhost:4200
- `npm run build` — Production build
- `npm run watch` — Build with watch mode
- `npm run test` — Unit tests (Karma + Jasmine)

## Design Notes
- Mobile-first responsive design
- Tailwind utility classes for rapid UI development
- SCSS for complex/component-scoped styles where needed
- Consistent spacing scale (Tailwind defaults)
- Color palette: primary (blue) + neutral grays
