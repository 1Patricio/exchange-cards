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
        :to="{name: 'trade-form'}"
      >
        <q-tooltip v-if="authStore.token == null">
          Necesesário fazer login para solicitar uma troca
        </q-tooltip>
      </q-btn>
    </div>

    <div v-if="tradeStore.isLoading">
      <LoadingComponent />
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
    <div v-if="authStore.token != null" >
      <q-separator class="q-my-lg"/>
      <div class="col">
  	    <div class="q-pa-md row justify-center q-gutter-md ">
          <q-card
            class="col-xs-4 cursor-pointer"
            style="background-color: #26a69a; min-width: 120px;"
            @click="onCardClick('card')"
          >
            <q-card-section class="row justify-center">
              <q-icon name="layers" size="6em" color="white"/>
            </q-card-section>
            <q-card-actions class="text-bold text-subtitle2 text-white justify-center">
                Cartas
            </q-card-actions>
          </q-card>

          <q-card
            class="col-xs-4 cursor-pointer"
            style="background-color: #26a69a; min-width: 120px;"
            @click="onCardClick('profile-card')"
          >
            <q-card-section class="row justify-center">
              <q-icon name="account_circle" size="6em" color="white"/>
            </q-card-section>
            <q-card-actions class="text-bold text-subtitle2 text-white justify-center" :to="{name: 'card'}">
                Perfil
            </q-card-actions>
          </q-card>
        </div>
	    </div>
    </div>
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
import LoadingComponent from '@/components/LoadingComponent.vue'

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
    name: 'card-offering',
    label: 'Oferecendo',
    field: (row: any) => row.tradeCards?.find((tradeOffering: any) => tradeOffering.type === 'OFFERING')?.card?.name ?? '-',
    align: 'left'
  },
  {
    name: 'card-receiving',
    label: 'Recebendo',
    field: (row: any) => row.tradeCards?.find((tradeReceiving: any) => tradeReceiving.type === 'RECEIVING')?.card?.name ?? '-',
    align: 'left'
  },
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

async function onScroll({ index, to, ref }: { index: number; to: number; ref: any }) {
  if (!canLoadMore.value) return

  if (to == index && tradeStore.more && !tradeStore.isLoading && tradeStore.page < tradeStore.nextPage) {
    try {
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

function onCardClick(route: string){
  router.push({name:`${route}`})
}
</script>
