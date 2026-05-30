import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createPost, fetchRecentPosts, uploadPostMedia } from "@/lib/posts";
import { supabase } from "@/lib/supabase";

export type VideoAudience = "everyone" | "followers" | "community";

export interface VideoPost {
  id: string;
  userId: string;
  creator: string;
  creatorAvatarUrl?: string;
  creatorRole?: string;
  caption: string;
  mediaPath: string;
  mediaUrl: string;
  createdAt: string;
  audience: VideoAudience;
  communityName?: string;
}

interface VideoPostsContextValue {
  ready: boolean;
  videoPosts: VideoPost[];
  refreshVideoPosts: () => Promise<void>;
  addVideoPost: (post: {
    userId: string;
    caption: string;
    uri: string;
    mimeType?: string | null;
    fileName?: string | null;
    audience?: VideoAudience;
    communityName?: string;
  }) => Promise<void>;
}

const VideoPostsContext = createContext<VideoPostsContextValue>({
  ready: false,
  videoPosts: [],
  refreshVideoPosts: async () => {},
  addVideoPost: async () => {},
});

export function VideoPostsProvider({ children }: { children: React.ReactNode }) {
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);
  const [ready, setReady] = useState(false);

  async function refreshVideoPosts() {
    const posts = await fetchRecentPosts(120);
    const onlyVideos = posts
      .filter((post) => post.mediaType === "video")
      .map<VideoPost>((post) => ({
        id: post.id,
        userId: post.authorId,
        creator: post.authorName,
        creatorAvatarUrl: post.authorAvatarUrl,
        creatorRole: undefined,
        caption: post.caption,
        mediaPath: post.mediaPath,
        mediaUrl: post.mediaUrl,
        createdAt: post.createdAt,
        audience: "everyone",
        communityName: undefined,
      }));

    setVideoPosts(onlyVideos);
  }

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      try {
        await refreshVideoPosts();

        channel = supabase
          .channel("video-posts-feed")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "posts" },
            async () => {
              if (!mounted) return;
              await refreshVideoPosts();
            }
          )
          .subscribe();

      } catch {
        // Keep empty list when backend query fails.
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function addVideoPost(post: {
    userId: string;
    caption: string;
    uri: string;
    mimeType?: string | null;
    fileName?: string | null;
    audience?: VideoAudience;
    communityName?: string;
  }) {
    const mediaPath = await uploadPostMedia({
      userId: post.userId,
      uri: post.uri,
      fileName: post.fileName,
      mimeType: post.mimeType,
      mediaType: "video",
    });

    await createPost({
      userId: post.userId,
      caption: post.caption,
      mediaType: "video",
      mediaPath,
    });

    await refreshVideoPosts();
  }

  const value = useMemo(
    () => ({ ready, videoPosts, refreshVideoPosts, addVideoPost }),
    [ready, videoPosts]
  );

  return <VideoPostsContext.Provider value={value}>{children}</VideoPostsContext.Provider>;
}

export function useVideoPosts() {
  return useContext(VideoPostsContext);
}
