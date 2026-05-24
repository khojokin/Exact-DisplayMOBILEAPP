import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type VideoAudience = "everyone" | "followers" | "community";

export interface VideoPost {
  id: string;
  creator: string;
  creatorRole?: string;
  creatorColor: string;
  caption: string;
  createdAt: number;
  audience: VideoAudience;
  communityName?: string;
}

interface VideoPostsContextValue {
  ready: boolean;
  videoPosts: VideoPost[];
  addVideoPost: (post: Omit<VideoPost, "id" | "createdAt">) => Promise<void>;
}

const STORAGE_KEY = "sda-community.video-posts.v1";

const VideoPostsContext = createContext<VideoPostsContextValue>({
  ready: false,
  videoPosts: [],
  addVideoPost: async () => {},
});

export function VideoPostsProvider({ children }: { children: React.ReactNode }) {
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as VideoPost[];
        if (!Array.isArray(parsed) || !mounted) return;
        setVideoPosts(parsed);
      } catch {
        // Keep defaults when storage parsing fails.
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function persist(next: VideoPost[]) {
    setVideoPosts(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function addVideoPost(post: Omit<VideoPost, "id" | "createdAt">) {
    const nextPost: VideoPost = {
      ...post,
      id: `${Date.now()}`,
      createdAt: Date.now(),
    };
    const next = [nextPost, ...videoPosts];
    await persist(next);
  }

  const value = useMemo(
    () => ({ ready, videoPosts, addVideoPost }),
    [ready, videoPosts]
  );

  return <VideoPostsContext.Provider value={value}>{children}</VideoPostsContext.Provider>;
}

export function useVideoPosts() {
  return useContext(VideoPostsContext);
}
