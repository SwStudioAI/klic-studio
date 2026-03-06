# kLic Studio

A Next.js monorepo with two areas: a **public marketing/explore site** and **kLic Studio** (a video creation panel for creators).

Connected to the real kLic API at **https://api.k-lic.com** ([docs](https://api.k-lic.com/docs)).

## Architecture

```
src/
  app/
    (public)/          # Public marketing + explore area
      layout.tsx       # Navbar + Footer wrapper
      page.tsx         # Landing page
      explore/         # Feed grid of posts (GET /api/v1/feed)
      p/[postId]/      # Post detail (GET /api/v1/posts/{postId})
      u/[username]/    # Public profile (GET /api/v1/profile/{username})
      login/           # JWT token login
    studio/            # Private creator studio (requires auth)
      layout.tsx       # Auth guard + sidebar
      page.tsx         # Projects list (GET /api/v1/studio/projects)
      p/[projectId]/   # Project detail with episodes
      e/[episodeId]/   # 3-column episode editor (scenes, preview, properties)
      r/[jobId]/       # Render job progress + SSE logs
  components/
    ui/                # shadcn/ui components
    public/            # Navbar, Footer, PostCard, VideoPlayer
    studio/            # AuthGuard, Sidebar, ScenesList, ScenePreview, PropertiesPanel
  lib/
    api.ts             # Fetch client with auth headers + 401 handling
    auth.ts            # JWT token get/set/clear (localStorage)
    sse.ts             # EventSource helper for render job events
    upload.ts          # R2 asset upload flow (init -> PUT -> complete)
    types.ts           # TypeScript interfaces matching real OpenAPI schemas
    schemas.ts         # Zod validation schemas
    utils.ts           # cn() helper from shadcn
  hooks/
    useMe.ts           # Current user query (GET /api/v1/users/me)
    useProjects.ts     # Projects CRUD
    useEpisodes.ts     # Episodes CRUD + render + publish
    useScenes.ts       # Scenes CRUD + reorder
```

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (New York style)
- **TanStack React Query** for data fetching & cache
- **Zod** + **React Hook Form** for form validation
- **@dnd-kit** for drag & drop scene reordering
- **Sonner** for toast notifications
- **@react-oauth/google** for Google Sign-In
- **Lucide React** for icons

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL (including `/api/v1`) | `https://api.k-lic.com/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID for Sign-In | _(required for Google auth)_ |

Copy `.env.example` to `.env.local` and adjust as needed.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Authentication

The `/login` page offers three authentication methods:

### 1. Email/Password Login
- Uses `POST /api/v1/auth/login` with `{ email_or_username, password }`
- Returns `access_token` + `refresh_token`

### 2. Google Sign-In
- Uses `@react-oauth/google` with the implicit flow
- Sends the Google access token to `POST /api/v1/auth/google`
- Server verifies with Google and returns kLic `access_token` + `refresh_token`
- Requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to be set

### 3. Dev Token (paste JWT)
- Paste a raw JWT for development/testing
- No refresh token stored

### Token Management
- `access_token` stored in `localStorage` as `klic_access_token`
- `refresh_token` stored in `localStorage` as `klic_refresh_token`
- All API requests include `Authorization: Bearer <access_token>`
- On 401, the client automatically attempts `POST /auth/refresh` with the refresh token
- If refresh succeeds, the original request is retried with the new token
- If refresh fails, both tokens are cleared and the user is redirected to `/login`
- Logout calls `POST /auth/logout` with the refresh token before clearing local storage

## API Contract (Real Endpoints)

All endpoints are at `https://api.k-lic.com/api/v1`. Types match the OpenAPI spec.

### Public
- `GET /feed` → `{ items: Post[], next_cursor, has_more }`
- `GET /posts/{postId}` → `Post` (with `user: PostAuthor`, `media: Media[]`)
- `GET /profile/{username}` → `{ user, stats, viewer_state, recent_posts, recent_reels }`
- `GET /users/me` → `User` (requires auth)

### Studio
- `GET /studio/projects` → `ProjectListItem[]` (with `episode_count`)
- `POST /studio/projects` → `ProjectListItem`
- `GET /studio/projects/{projectId}` → `ProjectResponse` (with nested `episodes[]`)
- `POST /studio/projects/{projectId}/episodes` → `Episode`
- `GET /studio/episodes/{episodeId}` → `Episode` (with nested `scenes[]`)
- `POST /studio/episodes/{episodeId}/scenes` → `Scene`
- `PATCH /studio/scenes/{sceneId}` → `Scene` (fields: `script_text`, `duration_seconds`, `order`, `image_asset_id`, `audio_asset_id`)
- `DELETE /studio/scenes/{sceneId}`

### Assets (R2 Upload)
- `POST /studio/assets/init-upload` → `{ upload_url, asset_id, url? }`
- `POST /studio/assets/complete-upload` → `{ asset_id, url }`

### Render
- `POST /studio/episodes/{episodeId}/render` → `{ job_id }`
- `GET /studio/render-jobs/{jobId}` → `{ job_id, status, progress, output_url?, error? }`
- `GET /studio/render-jobs/{jobId}/events` (SSE stream)

### Publish
- `POST /studio/episodes/{episodeId}/publish` → `{ post_id, url }`

## Key Differences from Generic Spec

- All paths prefixed with `/api/v1/`
- Scenes use `duration_seconds` (not `duration`) and `image_asset_id`/`audio_asset_id` (not URLs)
- Projects list returns `episode_count` (not `episodes_count`)
- Episode statuses: `draft`, `ready`, `rendering`, `done`, `failed` (lowercase)
- Render job statuses: `queued`, `running`, `done`, `failed`, `canceled` (lowercase)
- Feed returns paginated `{ items, next_cursor, has_more }` wrapper
- Profile endpoint is `/profile/{username}` (singular, not `/profiles/`)
