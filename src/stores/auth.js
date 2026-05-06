import { defineStore } from "pinia";
import { ref } from "vue";

const API = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore("auth", () => {
  const token = ref(null);
  const username = ref(null);

  async function login(user, pass) {
    const res = await fetch(`${API}/auth/token/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    token.value = data.auth_token;
    username.value = user;
  }

  async function logout() {
    if (token.value) {
      await fetch(`${API}/auth/token/logout/`, {
        method: "POST",
        headers: { Authorization: `Token ${token.value}` },
      });
    }
    token.value = null;
    username.value = null;
  }

  return { token, username, login, logout };
});
