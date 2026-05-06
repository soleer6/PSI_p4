<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  await auth.logout();
  setTimeout(() => router.push({ name: "home" }), 5000);
});
</script>

<template>
  <div class="text-center mt-5">
    <p class="fs-4">has salido del sistema</p>
    <p class="text-muted">Redirecting to home in 5 seconds…</p>
  </div>
</template>
