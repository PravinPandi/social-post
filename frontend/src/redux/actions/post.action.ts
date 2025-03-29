import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/posts';

// Fetch all posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: { title: string; content: string; image?: string }) => {
    const response = await axios.post(API_URL, postData);
    return response.data;
  }
);

// Update a post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({
    id,
    postData,
  }: {
    id: string;
    postData: { title: string; content: string; image?: string };
  }) => {
    const response = await axios.put(`${API_URL}/${id}`, postData);
    return response.data;
  }
);

// Delete a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);
