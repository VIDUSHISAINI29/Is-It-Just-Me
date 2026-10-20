
<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../lib/auth.js'

const { user } = useAuth()

const PAGE_SIZE = 5
const VISITOR_KEY = 'is-it-just-me-visitor-id'

const thoughts = ref([])
const content = ref('')
const loading = ref(true)
const loadingMore = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const reactions = ref({})
const reacting = ref({})
const hasMore = ref(true)

const editingId = ref(null)
const editContent = ref('')
const savingEdit = ref(false)
const deletingId = ref(null)

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_KEY)

  if (!visitorId) {
    visitorId = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, visitorId)
  }

  return visitorId
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isOwner(thought) {
  return Boolean(user.value && user.value.id === thought.user_id)
}

async function fetchReactionsForThoughts(thoughtIds) {
  if (!thoughtIds.length) return

  const { data, error } = await supabase
    .from('reactions')
    .select('thought_id, user_id, visitor_id')
    .in('thought_id', thoughtIds)

  if (error) throw error

  const updatedReactions = { ...reactions.value }

  for (const thoughtId of thoughtIds) {
    const thoughtReactions = data.filter(
      (reaction) => reaction.thought_id === thoughtId,
    )

    updatedReactions[thoughtId] = {
      count: thoughtReactions.length,
      reacted: thoughtReactions.some((reaction) => {
        if (user.value) {
          return reaction.user_id === user.value.id
        }

        return (
          reaction.user_id === null &&
          reaction.visitor_id === getVisitorId()
        )
      }),
    }
  }

  reactions.value = updatedReactions
}

async function fetchThoughts({ reset = false } = {}) {
  if (reset) {
    loading.value = true
    errorMessage.value = ''
    thoughts.value = []
    reactions.value = {}
    hasMore.value = true
  } else {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
  }

  try {
    const from = reset ? 0 : thoughts.value.length
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('thoughts')
      .select('id, content, created_at, user_id')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, to)

    if (error) throw error

    const fetchedThoughts = data ?? []

    thoughts.value = reset
      ? fetchedThoughts
      : [...thoughts.value, ...fetchedThoughts]

    hasMore.value = fetchedThoughts.length === PAGE_SIZE

    await fetchReactionsForThoughts(
      fetchedThoughts.map((thought) => thought.id),
    )
  } catch (error) {
    errorMessage.value = error.message || 'Could not load thoughts.'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function postThought() {
  const text = content.value.trim()

  if (text.length < 3 || text.length > 200 || submitting.value) return
  if (!user.value) return

  submitting.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.from('thoughts').insert({
      content: text,
      user_id: user.value.id,
    })

    if (error) throw error

    content.value = ''
    await fetchThoughts({ reset: true })
  } catch (error) {
    errorMessage.value = error.message || 'Could not post your thought.'
  } finally {
    submitting.value = false
  }
}

function startEditing(thought) {
  editingId.value = thought.id
  editContent.value = thought.content
  errorMessage.value = ''
}

function cancelEditing() {
  editingId.value = null
  editContent.value = ''
}

async function saveEdit(thought) {
  const text = editContent.value.trim()

  if (!isOwner(thought)) return

  if (text.length < 3 || text.length > 200 || savingEdit.value) {
    return
  }

  savingEdit.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('thoughts')
      .update({ content: text })
      .eq('id', thought.id)
      .select('id, content, created_at, user_id')
      .single()

    if (error) throw error

    thoughts.value = thoughts.value.map((item) =>
      item.id === thought.id ? data : item,
    )

    cancelEditing()
  } catch (error) {
    errorMessage.value = error.message || 'Could not update your thought.'
  } finally {
    savingEdit.value = false
  }
}

async function deleteThought(thought) {
  if (!isOwner(thought) || deletingId.value) return

  const confirmed = window.confirm(
    'Are you sure you want to delete this thought? This cannot be undone.',
  )

  if (!confirmed) return

  deletingId.value = thought.id
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', thought.id)

    if (error) throw error

    thoughts.value = thoughts.value.filter(
      (item) => item.id !== thought.id,
    )

    const updatedReactions = { ...reactions.value }
    delete updatedReactions[thought.id]
    reactions.value = updatedReactions

    if (editingId.value === thought.id) {
      cancelEditing()
    }
  } catch (error) {
    errorMessage.value = error.message || 'Could not delete your thought.'
  } finally {
    deletingId.value = null
  }
}

async function toggleReaction(thought) {
  const thoughtId = thought.id

  if (reacting.value[thoughtId]) return
  if (isOwner(thought)) return

  reacting.value = {
    ...reacting.value,
    [thoughtId]: true,
  }

  errorMessage.value = ''

  try {
    const visitorId = user.value ? null : getVisitorId()
    const currentReaction = reactions.value[thoughtId]

    if (currentReaction?.reacted) {
      let query = supabase
        .from('reactions')
        .delete()
        .eq('thought_id', thoughtId)

      if (user.value) {
        query = query.eq('user_id', user.value.id)
      } else {
        query = query
          .is('user_id', null)
          .eq('visitor_id', visitorId)
      }

      const { error } = await query
      if (error) throw error
    } else {
      const { error } = await supabase.from('reactions').insert({
        thought_id: thoughtId,
        user_id: user.value?.id ?? null,
        visitor_id: visitorId,
      })

      if (error) throw error
    }

    await fetchReactionsForThoughts([thoughtId])
  } catch (error) {
    errorMessage.value = error.message || 'Could not update your reaction.'
  } finally {
    reacting.value = {
      ...reacting.value,
      [thoughtId]: false,
    }
  }
}

watch(
  () => user.value?.id,
  async () => {
    try {
      await fetchReactionsForThoughts(
        thoughts.value.map((thought) => thought.id),
      )
    } catch (error) {
      errorMessage.value = error.message || 'Could not refresh reactions.'
    }
  },
)

onMounted(() => fetchThoughts({ reset: true }))
</script>

<template>
  <section class="tw-mx-auto tw-mt-10 tw-w-full tw-max-w-2xl">
    <form
      v-if="user"
      @submit.prevent="postThought"
      class="tw-mb-10 tw-rounded-2xl tw-border tw-border-[#eee3d7] tw-bg-white tw-p-5"
    >
      <label for="thought" class="tw-mb-3 tw-block tw-text-lg tw-font-semibold">
        What's on your mind?
      </label>

      <textarea
        id="thought"
        v-model="content"
        minlength="3"
        maxlength="200"
        required
        rows="3"
        placeholder="Something you thought only you did..."
        class="tw-w-full tw-resize-none tw-rounded-xl tw-border tw-border-[#e8ddd1] tw-bg-[#fffaf5] tw-p-3 tw-outline-none focus:tw-border-[#e8822d]"
      />

      <div class="tw-mt-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
        <span class="tw-text-sm tw-text-[#8b8176]">
          {{ content.length }}/200
        </span>

        <button
          type="submit"
          :disabled="submitting || content.trim().length < 3 || content.trim().length > 200"
          class="tw-rounded-full tw-bg-[#e8822d] tw-px-5 tw-py-2 tw-font-medium tw-text-white hover:tw-bg-[#d97320] disabled:tw-opacity-50"
        >
          {{ submitting ? 'Posting...' : 'Share thought' }}
        </button>
      </div>
    </form>

    <div class="tw-mb-5 tw-flex tw-items-center tw-justify-between tw-gap-3">
      <div>
        <h2 class="tw-text-2xl tw-font-bold">People get it.</h2>
        <p class="tw-mt-1 tw-text-sm tw-text-[#8b8176]">
          Little thoughts. Surprisingly relatable.
        </p>
      </div>

      <button
        type="button"
        @click="fetchThoughts({ reset: true })"
        :disabled="loading || loadingMore"
        class="tw-rounded-full tw-border tw-border-[#e8ddd1] tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-white disabled:tw-opacity-50"
      >
        Refresh
      </button>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="tw-mb-4 tw-rounded-xl tw-bg-red-50 tw-p-3 tw-text-sm tw-text-red-700"
    >
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="tw-py-12 tw-text-center tw-text-[#8b8176]">
      Finding relatable thoughts...
    </div>

    <div
      v-else-if="thoughts.length === 0"
      class="tw-rounded-2xl tw-border tw-border-dashed tw-border-[#e8ddd1] tw-p-10 tw-text-center"
    >
      <p class="tw-text-lg tw-font-semibold">It's a little quiet here.</p>
      <p class="tw-mt-2 tw-text-sm tw-text-[#8b8176]">
        Be the first to share a thought.
      </p>
    </div>

    <div v-else class="tw-space-y-4">
      <article
        v-for="thought in thoughts"
        :key="thought.id"
        class="tw-rounded-2xl tw-border tw-border-[#eee3d7] tw-bg-white tw-p-5"
      >
        <template v-if="editingId === thought.id">
          <form @submit.prevent="saveEdit(thought)">
            <label
              :for="`edit-${thought.id}`"
              class="tw-mb-2 tw-block tw-text-sm tw-font-semibold"
            >
              Edit your thought
            </label>

            <textarea
              :id="`edit-${thought.id}`"
              v-model="editContent"
              minlength="3"
              maxlength="200"
              required
              rows="3"
              class="tw-w-full tw-resize-none tw-rounded-xl tw-border tw-border-[#e8ddd1] tw-bg-[#fffaf5] tw-p-3 tw-outline-none focus:tw-border-[#e8822d]"
            />

            <div class="tw-mt-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
              <span class="tw-text-xs tw-text-[#8b8176]">
                {{ editContent.length }}/200
              </span>

              <div class="tw-flex tw-gap-2">
                <button
                  type="button"
                  @click="cancelEditing"
                  :disabled="savingEdit"
                  class="tw-rounded-full tw-border tw-border-[#e8ddd1] tw-px-4 tw-py-2 tw-text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  :disabled="savingEdit || editContent.trim().length < 3 || editContent.trim().length > 200"
                  class="tw-rounded-full tw-bg-[#e8822d] tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white disabled:tw-opacity-50"
                >
                  {{ savingEdit ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </form>
        </template>

        <template v-else>
          <p class="tw-whitespace-pre-wrap tw-break-words tw-text-lg tw-leading-relaxed">
            {{ thought.content }}
          </p>

          <div class="tw-mt-4 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
            <time class="tw-text-xs tw-text-[#8b8176]">
              {{ formatDate(thought.created_at) }}
            </time>

            <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
              <template v-if="isOwner(thought)">
                <button
                  type="button"
                  @click="startEditing(thought)"
                  :disabled="deletingId === thought.id"
                  class="tw-rounded-full tw-border tw-border-[#e8ddd1] tw-px-3 tw-py-2 tw-text-sm hover:tw-bg-[#fffaf5]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  @click="deleteThought(thought)"
                  :disabled="deletingId === thought.id"
                  class="tw-rounded-full tw-border tw-border-red-200 tw-px-3 tw-py-2 tw-text-sm tw-text-red-600 hover:tw-bg-red-50 disabled:tw-opacity-50"
                >
                  {{ deletingId === thought.id ? 'Deleting...' : 'Delete' }}
                </button>
              </template>

              <button
                type="button"
                @click="toggleReaction(thought)"
                :disabled="reacting[thought.id] || isOwner(thought)"
                :aria-pressed="Boolean(reactions[thought.id]?.reacted)"
                class="tw-rounded-full tw-border tw-px-4 tw-py-2 tw-text-sm tw-font-medium transition"
                :class="reactions[thought.id]?.reacted
                  ? 'tw-border-[#e8822d] tw-bg-[#fff0e2] tw-text-[#b65b14]'
                  : 'tw-border-[#eee3d7] tw-text-[#51483f] hover:tw-bg-[#fffaf5]'"
              >
                🥹
                {{ reactions[thought.id]?.reacted ? 'ME TOO!' : 'WAIT, ME TOO!' }}
                <span class="tw-ml-1">
                  {{ reactions[thought.id]?.count ?? 0 }}
                </span>
              </button>
            </div>
          </div>
        </template>
      </article>

      <div v-if="hasMore" class="tw-flex tw-justify-center tw-pt-4">
        <button
          type="button"
          @click="fetchThoughts()"
          :disabled="loadingMore"
          class="tw-rounded-full tw-border tw-border-[#e8ddd1] tw-bg-white tw-px-6 tw-py-3 tw-font-medium hover:tw-bg-[#fff0e2] disabled:tw-opacity-50"
        >
          {{ loadingMore ? 'Loading...' : 'Load more thoughts' }}
        </button>
      </div>

      <p
        v-else
        class="tw-py-5 tw-text-center tw-text-sm tw-text-[#8b8176]"
      >
        You're all caught up. 💛
      </p>
    </div>
  </section>
</template>
