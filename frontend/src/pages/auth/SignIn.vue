
<script setup>
import { ref } from 'vue'
import { useAuth } from '../../lib/auth.js'

const { user, signInWithGoogle } = useAuth()

const errorMessage = ref('')
const submitting = ref(false)

async function handleLogin() {
  if (submitting.value) return

  errorMessage.value = ''
  submitting.value = true

  try {
    await signInWithGoogle()
  } catch (error) {
    errorMessage.value = error.message || 'Could not sign in.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="tw-relative tw-mx-auto tw-w-full tw-max-w-3xl tw-overflow-hidden tw-px-1 tw-py-12 tw-text-center sm:tw-py-20">
    <!-- Decorative details -->
    <div class="tw-pointer-events-none tw-absolute tw-left-2 tw-top-16 tw-hidden tw-rotate-[-14deg] tw-font-serif tw-text-5xl tw-text-[#e7a58b] sm:tw-block">
      ✳
    </div>

    <div class="tw-pointer-events-none tw-absolute tw-right-3 tw-top-28 tw-hidden tw-rotate-12 tw-text-5xl sm:tw-block">
      🫠
    </div>

    <!-- Eyebrow -->
    <div class="tw-inline-flex tw-rotate-[-2deg] tw-items-center tw-gap-2 tw-rounded-full tw-border tw-border-[#e9c5ad] tw-bg-[#fff1e5] tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.13em] tw-text-[#ad5739]">
      <span>✳</span>
      A little corner of the internet
    </div>

    <!-- Main headline -->
    <h1 class="tw-mx-auto tw-mt-8 tw-max-w-2xl tw-font-serif tw-text-5xl tw-font-bold tw-leading-[0.98] tw-tracking-[-0.055em] tw-text-[#302922] sm:tw-text-7xl">
      Wait...
      <span class="tw-relative tw-inline-block tw-text-[#d96443]">
        it's not just me?
        <svg
          class="tw-absolute tw--bottom-2 tw-left-0 tw-w-full"
          viewBox="0 0 300 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 8C65 2 204 2 296 7"
            stroke="#E9A17F"
            stroke-width="5"
            stroke-linecap="round"
          />
        </svg>
      </span>
    </h1>

    <p class="tw-mx-auto tw-mt-7 tw-max-w-lg tw-text-base tw-leading-7 tw-text-[#74675b] sm:tw-text-lg sm:tw-leading-8">
      Weird little thoughts. Unspoken feelings. Random human things.
      Find your people who just <span class="tw-font-semibold tw-text-[#302922]">get it.</span>
    </p>

    <!-- Login card -->
    <div
      v-if="!user"
      class="tw-mx-auto tw-mt-10 tw-w-full tw-max-w-md tw-rounded-[2rem] tw-border tw-border-[#eadfd3] tw-bg-white tw-p-6 tw-text-left tw-shadow-[0_12px_45px_rgba(72,48,30,0.06)] sm:tw-p-8"
    >
      <div class="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div>
          <p class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.16em] tw-text-[#c16b4a]">
            Come as you are
          </p>
          <h2 class="tw-mt-2 tw-font-serif tw-text-3xl tw-font-bold tw-text-[#302922]">
            You're among your people.
          </h2>
        </div>

        <span class="tw-flex tw-h-12 tw-w-12 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-[#fce7d8] tw-text-2xl">
          🫶
        </span>
      </div>

      <p class="tw-mt-3 tw-text-sm tw-leading-6 tw-text-[#8a8075]">
        Sign in to share your thoughts, edit your posts, and join the
        collective “WAIT, ME TOO!” moments.
      </p>

      <button
        type="button"
        @click="handleLogin"
        :disabled="submitting"
        class="tw-mt-6 tw-flex tw-w-full tw-items-center tw-justify-center tw-gap-3 tw-rounded-2xl tw-bg-[#29251f] tw-px-5 tw-py-4 tw-font-semibold tw-text-white tw-transition tw-duration-200 hover:tw--translate-y-0.5 hover:tw-bg-[#d96443] disabled:tw-translate-y-0 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
      >
        <svg
          v-if="!submitting"
          viewBox="0 0 48 48"
          class="tw-h-5 tw-w-5 tw-rounded-full tw-bg-white tw-p-0.5"
          aria-hidden="true"
        >
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.97 46.98 31.81 46.98 24.55Z" />
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>

        <span>
          {{ submitting ? 'Opening Google...' : 'Continue with Google' }}
        </span>

        <span v-if="!submitting" aria-hidden="true">↗</span>
      </button>

      <p
        v-if="errorMessage"
        role="alert"
        class="tw-mt-4 tw-rounded-xl tw-bg-red-50 tw-p-3 tw-text-sm tw-leading-5 tw-text-red-700"
      >
        {{ errorMessage }}
      </p>

      <div class="tw-mt-5 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-xs tw-text-[#9a8e81]">
        <span>🔒</span>
        <span>One quick sign-in. No complicated setup.</span>
      </div>
    </div>

    <!-- Footer note -->
    <div class="tw-mt-8 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-sm tw-text-[#8a8075]">
      <span>🌼</span>
      <p>No judgment here. We've all been there.</p>
    </div>

    <p class="tw-mt-3 tw-font-serif tw-text-sm tw-italic tw-text-[#b28b73]">
      Same brain, different people.
    </p>
  </section>
</template>
