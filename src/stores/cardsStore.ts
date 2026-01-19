import api from '@/api/api'
import type { Card } from '@/models/Card'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCardsStore = defineStore('cards', () => {
  const listCards = ref<Card[]>([])
  const listAllCards = ref<Card[]>([])
  const listUserCards = ref<Card[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const page = ref(1)
  const rpp = ref(9)
  const more = ref(false)
  const totalPages = ref(1)
  const totalPagesUserCards = ref(1)

  async function getCards() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await api.get('/cards', {
        params: {
          page: page.value,
          rpp: rpp.value,
        },
      })

      listCards.value = data.list
      more.value = data.more

      if (data.more == true && page.value == totalPages.value) {
        totalPages.value++
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getAllCards() {
    isLoading.value = true
    error.value = null

    listAllCards.value = []

    let currentPage = 1
    let hasMore = true

    try {
      while (hasMore) {
        const { data } = await api.get('/cards', {
          params: {
            page: currentPage,
            rpp: rpp.value,
          },
        })

        listAllCards.value.push(...data.list)
        hasMore = data.more
        currentPage++
      }

      more.value = false
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getUserCards() {
    isLoading.value = true
    error.value = null

    listUserCards.value = []

    try {
      const { data } = await api.get('/me/cards')
      listUserCards.value = data
      more.value = data.more

      if (data.more == true && page.value == totalPages.value) {
        totalPagesUserCards.value++
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function postUserCard(idCard: string) {
    error.value = null
    isLoading.value = true

    try {
      await api.post('/me/cards', { cardIds: [idCard] })
      await getUserCards()
    } catch (err: any) {
      if (err.code == 'ERR_BAD_REQUEST') {
        error.value = err?.response?.data?.message || err.response.data.error
      } else {
        error.value = err?.response?.data?.message || err.message
      }
      throw new Error(error.value!)
    } finally {
      isLoading.value = false
    }
  }

  return {
    listCards,
    listUserCards,
    listAllCards,
    error,
    isLoading,
    page,
    rpp,
    more,
    totalPages,
    totalPagesUserCards,
    getCards,
    getAllCards,
    getUserCards,
    postUserCard,
  }
})
