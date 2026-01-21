<template>
  <div class="q-pa-md">
    <div class="flex justify-between align-conten q-mb-sm" style="align-items: center; height: 80px;">
      <h5 class=" text-secondary text-bold">Lista de Trocas</h5>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Solicitar Troca"
        style="max-width: 200px; height: 10px;"
        :disable="authStore.token == null"
      >
        <q-tooltip v-if="authStore.token == null">
          Necesesário fazer login para solicitar uma troca
        </q-tooltip>
      </q-btn>
    </div>
    <q-table
      flat
      bordered
      style="height: 500px"
      :rows="listTrade"
      :columns="columns"
      :loading="tradeStore.isLoading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination="{ rowsPerPage: 0 }"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      hide-pagination
      @row-click="onClick"
      table-header-class="bg-grey-3"

    />

  </div>
</template>

<script setup lang="ts">
import { useTradesStore } from '@/stores/tradesStore'
import { nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotification } from '@/composables/useNotification'
import { useRouter } from 'vue-router'
import type { QTableColumn } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const tradeStore = useTradesStore()
const { listTrade } = storeToRefs(tradeStore)
const notification = useNotification()
const router = useRouter()
const authStore = useAuthStore()

const canLoadMore = ref(false)

const columns: QTableColumn[] = [
  {
    name: 'user',
    label: 'Usuário',
    field: (row: any) => row.user?.name ?? 'Desconhecido',
    align: 'left',
    sortable: true
  },
  {
    name: 'card-receiving',
    label: 'Recebendo',
    field: (row: any) => row.tradeCards?.find((tradeReceiving: any) => tradeReceiving.type === 'RECEIVING')?.card?.name ?? '-',
    align: 'left'
  },
  {
    name: 'card-offering',
    label: 'Oferecendo',
    field: (row: any) => row.tradeCards?.find((tradeOffering: any) => tradeOffering.type === 'OFFERING')?.card?.name ?? '-',
    align: 'left'
  }
]

onMounted(async () => {
  try {
    await tradeStore.getTrades()
    await nextTick()
    setTimeout(() => {
      canLoadMore.value = true
    }, 500)
  } catch (error) {
    notification.error('Erro ao carregar lista de trocas de cartas')
    console.error(error)
  }
})

async function onScroll({ to, ref }: { to: number; ref: any }) {
  if (!canLoadMore.value) return

  const lastIndex = listTrade.value.length - 1
  const threshold = Math.max(0, lastIndex - 2)

  if (to >= threshold && tradeStore.more && !tradeStore.isLoading) {
    try {
      tradeStore.page++
      await tradeStore.getTrades()
      await nextTick()
      ref.refresh()
    } catch (error) {
      notification.error('Erro ao carregar mais trocas')
      console.error(error)
      tradeStore.page--
    }
  }
}

function onClick(_evt: Event, row: any) {
  tradeStore.setSelectedTrade(row)
  router.push({
    name: 'trades-view',
    params: { id: row.id }
  })
}
</script>
