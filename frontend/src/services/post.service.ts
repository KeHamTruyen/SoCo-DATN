import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

export interface ProductBasic {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: Array<{ url: string; altText: string | null }>;
  category: {
    id: string;
    name: string;
  } | null;
  seller: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface PostComment {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: User;
  replies?: PostComment[];
  _count?: {
    replies: number;
  };
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType: 'IMAGE' | 'VIDEO' | 'NONE';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: User & {
    _count?: {
      followers: number;
      following: number;
      products: number;
      posts: number;
    };
  };
  product: ProductBasic | null;
  isLiked?: boolean;
  comments?: PostComment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface CreatePostData {
  content: string;
  mediaUrls?: string[];
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  productId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
}

export interface UpdatePostData {
  content?: string;
  mediaUrls?: string[];
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  productId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
}

export interface PostFilters {
  page?: number;
  limit?: number;
  authorId?: string;
  productId?: string;
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: PaginationData;
}

export interface PostResponse {
  success: boolean;
  data: {
    post: Post;
  };
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    comment: PostComment;
  };
}

export interface CommentsResponse {
  success: boolean;
  data: PostComment[];
  pagination: PaginationData;
}

// Get axios instance with auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all posts (Feed)
 */
export const getPosts = async (filters: PostFilters = {}): Promise<PostsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.authorId) params.append('authorId', filters.authorId);
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.visibility) params.append('visibility', filters.visibility);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await axios.get(`${API_URL}/posts?${params.toString()}`);
  return response.data;
};

/**
 * Get single post by ID
 */
export const getPost = async (postId: string): Promise<PostResponse> => {
  const response = await axios.get(`${API_URL}/posts/${postId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Get my posts (logged in user)
 */
export const getMyPosts = async (filters: PostFilters = {}): Promise<PostsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);

  const response = await axios.get(`${API_URL}/posts/me?${params.toString()}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Get posts by specific user
 */
export const getUserPosts = async (userId: string, filters: PostFilters = {}): Promise<PostsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);

  const response = await axios.get(`${API_URL}/posts/user/${userId}?${params.toString()}`);
  return response.data;
};

/**
 * Create new post
 */
export const createPost = async (data: CreatePostData): Promise<PostResponse> => {
  const response = await axios.post(`${API_URL}/posts`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Update post
 */
export const updatePost = async (postId: string, data: UpdatePostData): Promise<PostResponse> => {
  const response = await axios.put(`${API_URL}/posts/${postId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Delete post
 */
export const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_URL}/posts/${postId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Like/Unlike post
 */
export const toggleLike = async (postId: string): Promise<LikeResponse> => {
  const response = await axios.post(
    `${API_URL}/posts/${postId}/like`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

/**
 * Add comment to post
 */
export const addComment = async (
  postId: string,
  content: string,
  parentId?: string
): Promise<CommentResponse> => {
  const response = await axios.post(
    `${API_URL}/posts/${postId}/comments`,
    { content, parentId },
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

/**
 * Get comments for a post
 */
export const getComments = async (
  postId: string,
  page: number = 1,
  limit: number = 20
): Promise<CommentsResponse> => {
  const response = await axios.get(
    `${API_URL}/posts/${postId}/comments?page=${page}&limit=${limit}`
  );
  return response.data;
};
