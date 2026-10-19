
<script setup>
import { useAuth } from '../../lib/auth.js'
import AuthSection from '../auth/SignIn.vue'
import ThoughtFeed from '../thoughtsFeed/ThoughtsFeed.vue'

const { user, loading, signOut } = useAuth()
</script>

<template>
  <main class="tw-min-h-screen tw-bg-[#fffaf5] tw-px-5 tw-py-8 tw-text-[#29251f]">
    <nav class="tw-mx-auto tw-flex tw-max-w-6xl tw-items-center tw-justify-between">
      <a href="/" class="tw-text-xl tw-font-black tw-tracking-tight">
        just<span class="tw-text-[#d96443]">me?</span>
      </a>

      <button
        v-if="!loading && user"
        @click="signOut"
        class="tw-rounded-full tw-border tw-border-stone-200 tw-px-4 tw-py-2 tw-text-sm tw-font-medium hover:tw-bg-white"
      >
        Sign out
      </button>
    </nav>

    <AuthSection v-if="!loading" />

    <ThoughtFeed />
  </main>
</template>
