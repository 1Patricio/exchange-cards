import api from "@/api/api";
import type { Trade } from "@/models/Trade";
import type { TradeCardRequest } from "@/models/TradeCard";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTradesStore = defineStore('trades', () => {
  const listTrade = ref<Trade[]>([])
  const listAllTrades = ref<Trade[]>([])
  const selectedTrade = ref<Trade | null>()
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  const page = ref(1)
  const nextPage = ref(2)
  const rpp = ref(10)
  const more = ref(false)

  async function getTrades() {
    isLoading.value = true;
    try {
      const response = await api.get(`/trades?rpp=${rpp.value}&page=${page.value}`);

      if (page.value === 1) {
        listTrade.value = response.data.list;
      } else {
        listTrade.value.push(...response.data.list);
      }

      more.value = response.data.more;
      if (page.value <= nextPage.value && more.value){
        page.value = nextPage.value
        nextPage.value++
        return
      }
    } catch (err: any) {
      error.value = err.message;
      throw err
    } finally {
      isLoading.value = false;
    }
  }

  async function getAllTrades() {
    isLoading.value = true
    error.value = null

    listAllTrades.value = []

    let currentPage = 1
    let hasMore = true

    try {
      while (hasMore) {
        const { data } = await api.get('/trades', {
          params: {
            page: currentPage,
            rpp: rpp.value,
          },
        })

        listAllTrades.value.push(...data.list)
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

  async function getTradesById(id: string | undefined) {
    await getAllTrades()
    selectedTrade.value = listAllTrades.value.find((trade) => trade.id == id)
    console.log('caiu get vy id' + id)
    console.log(selectedTrade.value)
  }

  async function postTrade(request: TradeCardRequest[]) {
    isLoading.value = true
    error.value = null
    try{
      const response = await api.post('/trades', {
        cards: request
      })
      return response.data
    }catch(err:any){
      error.value = err?.response?.data?.message || err?.message
      throw err
    }finally{
      isLoading.value = false
    }
  }

  async function setSelectedTrade(trade: Trade){
    selectedTrade.value = trade
  }

  return {
    listTrade,
    selectedTrade,
    isLoading,
    error,
    page,
    nextPage,
    rpp,
    more,
    getTrades,
    getTradesById,
    postTrade,
    setSelectedTrade
  }
})
