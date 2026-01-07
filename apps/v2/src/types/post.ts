/**
 * Post/Message-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/posts.ts
 */

import type { IFileInfo } from "./file";
import type { ICustomEmoji } from "./emoji";
import type { IChannelType } from "./channel";

//#region Post Types

export type IPostType =
  // Empty (regular user post)
  | ""
  // Channel membership
  | "system_join_leave"
  | "system_join_channel"
  | "system_leave_channel"
  | "system_add_to_channel"
  | "system_remove_from_channel"
  | "system_add_remove"
  // Team membership
  | "system_join_team"
  | "system_leave_team"
  | "system_add_to_team"
  | "system_remove_from_team"
  // Channel changes
  | "system_header_change"
  | "system_displayname_change"
  | "system_convert_channel"
  | "system_purpose_change"
  | "system_channel_deleted"
  | "system_channel_restored"
  // System messages
  | "system_generic"
  | "system_fake_parent_deleted"
  | "system_ephemeral"
  | "system_ephemeral_add_to_channel"
  | "system_auto_responder"
  // Guest user events
  | "system_guest_join_channel"
  | "system_add_guest_to_chan"
  | "system_join_leave_channel"
  // GM conversion
  | "system_gm_to_channel"
  // Combined activity
  | "system_combined_user_activity"
  // User actions
  | "me"
  | "reminder"
  | "remove_link_preview"
  // Bot events
  | "add_bot_teams_channels"
  // Custom integrations
  | "system_wrangler"
  | "custom_calls"
  | "custom_calls_recording"
  | "custom_spillage_report"
  // Special
  | "burn_on_read";

export type IPostState = "" | "DELETED";

//#endregion

//#region Post Priority

export type IPostPriority = "" | "urgent" | "important";

export type IPostPriorityMetadata = {
  priority: IPostPriority;
  requested_ack?: boolean;
  persistent_notifications?: boolean;
};

//#endregion

//#region Post Embed

export type IPostEmbedType =
  | "image"
  | "link"
  | "message_attachment"
  | "opengraph"
  | "permalink";

export type IOpenGraphMetadataImage = {
  secure_url?: string;
  url: string;
  type?: string;
  height?: number;
  width?: number;
};

export type IOpenGraphMetadata = {
  type?: string;
  title?: string;
  description?: string;
  site_name?: string;
  url?: string;
  images: IOpenGraphMetadataImage[];
};

export type IPostPreviewMetadata = {
  post_id: string;
  post?: IPost;
  channel_display_name: string;
  team_name: string;
  channel_type: IChannelType;
  channel_id: string;
};

export type IPostEmbed = {
  type: IPostEmbedType;
  url: string;
  data?: IOpenGraphMetadata | IPostPreviewMetadata;
};

//#endregion

//#region Post Image

export type IPostImage = {
  format: string;
  frameCount: number;
  height: number;
  width: number;
};

//#endregion

//#region Post Acknowledgement

export type IPostAcknowledgement = {
  post_id: string;
  user_id: string;
  acknowledged_at: number;
};

//#endregion

//#region Post Metadata

export type IPostMetadata = {
  embeds?: IPostEmbed[];
  emojis?: ICustomEmoji[];
  files?: IFileInfo[];
  images?: Record<string, IPostImage>;
  reactions?: IReaction[];
  priority?: IPostPriorityMetadata;
  acknowledgements?: IPostAcknowledgement[];
  expire_at?: number;
  recipients?: string[];
};

//#endregion

//#region Post

export type IPost = {
  id: string;
  create_at: number;
  update_at: number;
  edit_at: number;
  delete_at: number;
  is_pinned: boolean;
  user_id: string;
  channel_id: string;
  root_id: string;
  original_id: string;
  message: string;
  type: IPostType;
  props: Record<string, unknown>;
  hashtags: string;
  pending_post_id: string;
  reply_count: number;
  file_ids?: string[];
  metadata: IPostMetadata;
  failed?: boolean;
  state?: IPostState;
  last_reply_at?: number;
  is_following?: boolean;
  remote_id?: string;
};

//#endregion

//#region Post List

export type IPostList = {
  order: string[];
  posts: Record<string, IPost>;
  next_post_id: string;
  prev_post_id: string;
  first_inaccessible_post_time: number;
};

export type IPaginatedPostList = IPostList & {
  has_next: boolean;
};

export type IPostSearchResults = IPostList & {
  matches: Record<string, string[]>;
};

//#endregion

//#region Post Order Block

export type IPostOrderBlock = {
  order: string[];
  recent?: boolean;
  oldest?: boolean;
};

//#endregion

//#region Reaction

export type IReaction = {
  user_id: string;
  post_id: string;
  emoji_name: string;
  create_at: number;
};

//#endregion

//#region Message Attachment

export type IMessageAttachmentField = {
  title?: string;
  value?: unknown;
  short?: boolean;
};

export type IPostAction = {
  id: string;
  type: "button" | "select";
  name: string;
  disabled?: boolean;
  style?: "default" | "primary" | "success" | "good" | "warning" | "danger";
  data_source?: "users" | "channels";
  options?: IPostActionOption[];
  default_option?: string;
  integration?: {
    url: string;
    context: Record<string, unknown>;
  };
  cookie?: string;
};

export type IPostActionOption = {
  text: string;
  value: string;
};

export type IMessageAttachment = {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: IMessageAttachmentField[] | null;
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  actions?: IPostAction[];
};

//#endregion

//#region Message History

export type IMessageHistory = {
  messages: string[];
  index: {
    post: number;
    comment: number;
  };
};

//#endregion
