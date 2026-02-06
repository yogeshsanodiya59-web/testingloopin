import axios from "axios";
import { auth } from "./firebase"; // Import initialized firebase auth

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically from Firebase or Local Admin Token
api.interceptors.request.use(async (config) => {
  // 1. Priority: Local Admin Token (if present)
  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }
  }

  // 2. Fallback: Firebase Token
  if (auth.currentUser) {
    try {
      // Force refresh if expired
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting token", error);
    }
  }
  return config;
});

export const loginLocal = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const response = await api.post("/auth/login", params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      console.warn("Session expired or invalid token.");

      // Prevent global redirect for Admin pages (handled locally)
      if (window.location.pathname.startsWith('/admin')) {
        return Promise.reject(error);
      }

      // Only redirect if we don't have a firebase session either
      // If we DO have a firebase session, AuthContext will handle it or it's a temporary token issue
      if (!auth.currentUser && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export const createPost = async (postData: { title: string; content: string; department: string; type: string; tags?: string; is_anonymous?: boolean }) => {
  const response = await api.post("/posts/", postData);
  return response.data;
};

// Posts
export const getPosts = async (skip = 0, limit = 10, department = 'ALL', tags?: string) => {
  const params: any = { skip, limit };
  if (department !== 'ALL') params.department = department;
  if (tags) params.tags = tags;

  const response = await api.get('/posts/', { params });
  return response.data;
};

export const getCampusNews = async () => {
  try {
    const response = await api.get("/news/");
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch news, using fallback.");
    return [];
  }
};

// Pin Post (Admin)
// Pin Post (Admin)
export const pinPost = async (postId: number, duration: string = "infinite") => {
  const response = await api.put(`/posts/${postId}/pin`, null, {
    params: { duration }
  });
  return response.data;
};

export const unpinPost = async (postId: number) => {
  const response = await api.put(`/posts/${postId}/unpin`);
  return response.data;
};

// Share Post (Smart Share)
export const sharePost = async (postId: number) => {
  try {
    const response = await api.patch(`/posts/${postId}/share`);
    return response.data;
  } catch (error) {
    console.warn("Failed to track share:", error);
    return null;
  }
};

// Comments
export const getComments = async (postId: number) => {
  const response = await api.get(`/posts/${postId}/comments/`);
  return response.data;
};

export const createComment = async (postId: number, content: string, parentId?: number) => {
  const response = await api.post(`/posts/${postId}/comments/`, {
    content
  });
  return response.data;
};

export const deleteComment = async (postId: number, commentId: number) => {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};

// Reactions
export const toggleReaction = async (targetType: 'post' | 'comment', targetId: number, emoji: string) => {
  const response = await api.post("/reactions/", {
    emoji,
    target_type: targetType,
    target_id: targetId
  });
  return response.data;
};

export const deletePost = async (postId: number) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

// Modified: Get Current User now just fetches profile data from backend
// Backend creates user if missing
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    return null;
  }
};

// Notifications
export const getNotifications = async (skip = 0, limit = 20) => {
  const response = await api.get(`/notifications/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const markNotificationRead = async (notificationId: number) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put(`/notifications/read-all`);
  return response.data;
};

// Profile Update
export interface ProfileUpdateData {
  full_name?: string;
  username?: string;
  bio?: string;
  department?: string;
  profile_photo_url?: string;
}

export const updateProfile = async (data: ProfileUpdateData) => {
  const response = await api.put("/users/me", data);
  return response.data;
};

export default api;
