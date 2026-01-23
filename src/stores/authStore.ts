import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/models/User";
import api from "@/api/api";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const error = ref<string | null>(null);

  try {
    const saved = localStorage.getItem('token')
    if (saved) {
      token.value = saved
      api.defaults.headers.common['Authorization'] = `Bearer ${saved}`
    }
  } catch (err) {
    throw err
  }

  async function login(email: string, password: string) {
    error.value = null

    try {
      const { data } = await api.post('/login', { email, password })

      user.value = data.user
      token.value = data.token

      localStorage.setItem('token', data.token)
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`

      return data
    } catch (err: any) {
      throw err
    }
  }

  async function register(name: string, email: string, password: string) {
    error.value = null;

    try {
      await api.post("/register", {
        name,
        email,
        password,
      });
    } catch (err: any) {
      if (err.code == "ERR_BAD_REQUEST") {
        error.value = err?.response?.data?.message || err.response.data.error;
      } else {
        error.value = err?.response?.data?.message || err.message;
      }
      throw new Error(error.value!);
    }
  }

  async function logout() {
    user.value = null;
    token.value = null;
    try {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } catch (err) {
      throw err
    }
  }

  const isAuthenticated = () => !!token.value;

  async function getUserCurrent() {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) return null

    api.defaults.headers.common.Authorization = `Bearer ${savedToken}`

    try {
      const res = await api.get("/me");

      if (res != null) {
        user.value = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          cards: res.data.cards
        }
        return user.value;
      }
    } catch (err: any) {
      await logout();
      throw err;
    }
  }

  return {
    user,
    token,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getUserCurrent,
  };
});
