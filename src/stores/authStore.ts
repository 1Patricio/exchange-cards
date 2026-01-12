import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/models/User";
import api from "@/api/api";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const error = ref<string | null>(null);

  try {
    const saved = localStorage.getItem('token')
    if (saved) {
      token.value = saved
      api.defaults.headers.common['Authorization'] = `Bearer ${saved}`
    }
  } catch (e) {
  }

  async function login(email: string, password: string) {
    error.value = null;

    try {
      const res = await api.post("/login", { email, password });

      user.value = res.data.user ?? ({ email } as User);
      token.value = res.data.token ?? null;

      if (token.value) {
        try {
          localStorage.setItem('token', token.value)
          api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
        } catch (e) {}
      }

      return res.data;
    } catch (err: any) {
      if(err.response.data.message == "Incorrect password/email") {
        error.value = "Credenciais Inválidas";

      } else {
        error.value =
        err?.response?.data?.message || err.message || "Erro no login";
      }
      throw new Error(error.value!);
    }
  }

  async function register(name: string, email: string, password: string) {
    error.value = null;

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
      });

      try {
        user.value = res.data.user ?? ({ email } as User);
        token.value = res.data.token ?? null;

        if (token.value) {
          try {
            localStorage.setItem('token', token.value)
            api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
          } catch (e) {}
        }

        return res.data;
      } catch (err: any) {
        if (err.code == "ERR_BAD_REQUEST") {
          error.value = "Credenciais Inválidas";
        } else {
          error.value =
            err?.response?.data?.message || err.message || "Erro no login";
        }
        throw new Error(error.value!);
      }
    } catch (err: any) {
      if (err.code == "ERR_BAD_REQUEST") {
        error.value = err?.response?.data?.message || err.response.data.error || "Erro ao cadastrar";
      } else {
        error.value = err?.response?.data?.message || err.message || "Erro no login";
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
    } catch (e) {}
  }

  const isAuthenticated = () => !!token.value;

  async function getUserCurrent() {
    error.value = null;

    if (!token.value) return null;

    try {
      const res = await api.get("/auth/me");

      user.value = res.data.user;
      return user.value;
    } catch (err: any) {
      await logout();
      return null;
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
