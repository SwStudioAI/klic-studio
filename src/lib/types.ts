// ─── Auth / User ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_verified: boolean;
  created_at: string;
}

// ─── Posts & Feed ───────────────────────────────────────────

export interface PostAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Media {
  id: string;
  type: string;
  url: string;
  thumb_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface Post {
  id: string;
  user_id: string;
  text: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  user: PostAuthor;
  media: Media[];
}

export interface FeedResponse {
  items: Post[];
  next_cursor: string | null;
  has_more: boolean;
}

// ─── Profile ────────────────────────────────────────────────

export interface ProfileUser {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  website: string | null;
  location: string | null;
  is_verified: boolean;
  is_private: boolean;
  created_at: string;
}

export interface ProfileStats {
  followers_count: number;
  following_count: number;
  posts_count: number;
  reels_count: number;
  likes_received: number;
}

export interface ProfileViewerState {
  is_own_profile: boolean;
  is_following: boolean;
  is_followed_by: boolean;
  is_blocked: boolean;
  is_muted: boolean;
  follow_status: string;
}

export interface ProfilePostPreview {
  id: string;
  thumbnail_url: string | null;
  has_video: boolean;
  has_multiple: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface ProfileReelPreview {
  id: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  views_count: number;
  created_at: string;
}

export interface ProfileResponse {
  user: ProfileUser;
  stats: ProfileStats;
  viewer_state: ProfileViewerState;
  recent_posts: ProfilePostPreview[];
  recent_reels: ProfileReelPreview[];
}

// ─── Studio: Projects ───────────────────────────────────────

export interface ProjectListItem {
  id: string;
  title: string;
  description: string | null;
  episode_count: number;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  episodes: Episode[];
  created_at: string;
}

// ─── Studio: Episodes ───────────────────────────────────────

export type EpisodeStatus = "draft" | "ready" | "rendering" | "done" | "failed";

export interface Episode {
  id: string;
  project_id: string;
  title: string;
  status: EpisodeStatus;
  scenes: Scene[];
  created_at: string;
}

// ─── Studio: Scenes ─────────────────────────────────────────

export interface Scene {
  id: string;
  episode_id: string;
  order: number;
  script_text: string | null;
  duration_seconds: number;
  image_asset_id: string | null;
  audio_asset_id: string | null;
  created_at: string;
}

export interface SceneCreatePayload {
  order?: number;
  script_text?: string | null;
  duration_seconds?: number;
  image_asset_id?: string | null;
  audio_asset_id?: string | null;
}

export interface SceneUpdatePayload {
  order?: number | null;
  script_text?: string | null;
  duration_seconds?: number | null;
  image_asset_id?: string | null;
  audio_asset_id?: string | null;
}

// ─── Studio: Render ─────────────────────────────────────────

export type RenderJobStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface RenderJob {
  job_id: string;
  status: RenderJobStatus;
  progress: number;
  output_url: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface RenderEvent {
  type: "progress" | "log" | "done" | "error";
  data: {
    progress?: number;
    message?: string;
    output_url?: string;
    error?: string;
  };
}

// ─── Studio: Assets ─────────────────────────────────────────

export interface AssetInitResponse {
  upload_url: string;
  asset_id: string;
  url?: string;
}

export interface AssetCompleteResponse {
  asset_id: string;
  url: string;
}

// ─── Studio: Publish ────────────────────────────────────────

export interface PublishResponse {
  post_id: string;
  url: string;
}

// ─── Auth ────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user: boolean;
  user: User;
}

// ─── Common ─────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status: number;
}
