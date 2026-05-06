<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push({ name: "home" });
  } catch {
    error.value = "Invalid credentials.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-4">
      <h1 class="mb-4">Login</h1>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input
            v-model="username"
            class="form-control"
            data-cy="username"
            type="text"
            required
            @keyup.enter="submit"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            class="form-control"
            data-cy="password"
            type="password"
            required
            @keyup.enter="submit"
          />
        </div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <button class="btn btn-primary w-100" type="submit" :disabled="loading">
          {{ loading ? "Logging in…" : "Login" }}
        </button>
      </form>
    </div>
  </div>
</template>
