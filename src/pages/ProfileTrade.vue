<template>
  <div class="q-pa-md">
    <div class="flex text-h6 justify-center q-mb-none" style="align-content: center;">
      <router-link class="text-grey-8" :to="{ name: 'profile-card' }">Cartas</router-link>
      <q-separator vertical spaced size="2px" style="max-height: 32px; color: black;"/>
      <p class="text-secondary text-bold">Trocas</p>
    </div>

    <h5 class="q-my-sm text-secondary text-bold">Minhas Solicitações</h5>
    <div v-if="tradeStore.isLoading">
      <LoadingComponent />
    </div>

    <div>
      <q-table
        flat
        bordered
        style="height: 500px"
        :rows="trades"
        :columns="columns"
        :loading="tradeStore.isLoading"
        row-key="id"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-size-start="48"
        :pagination="{ rowsPerPage: 0 }"
        :rows-per-page-options="[0]"
        hide-pagination
        table-header-class="bg-grey-3"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="delete" color="red" @click="onDelete(props.row.id)"></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

  </div>
</template>

<script setup lang="ts">
import LoadingComponent from '@/components/LoadingComponent.vue';
import { useNotification } from '@/composables/useNotification';
import type { Trade } from '@/models/Trade';
import { useTradesStore } from '@/stores/tradesStore';
import { useQuasar, type QTableColumn } from 'quasar';
import { onMounted, ref } from 'vue';

const tradeStore = useTradesStore()
const notification = useNotification()
const $q = useQuasar()

const trades = ref<Trade[]>([])

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
  {
    name: 'actions',
    label: 'Ações',
    field: '',
    align: 'center'
  }


]

onMounted(async () => {
    try {
    await tradeStore.getUserTrades()
    trades.value = tradeStore.listUserTrade
  } catch {
    notification.error("Erro ao buscar solicitação de trocas")
  }
})

async function onDelete(id: string) {
  $q.dialog({
    title: 'Deseja realmente deletar esta solicitação do seu perfil?',
    message: 'Essa ação não pode ser desfeita',
    cancel: {
      label: 'Cancelar',
      color: 'red',
    },
    persistent: true,
    ok: {
      label: 'Sim',
      color: 'secondary',
    },
  }).onOk(async () => {
    try {
      await tradeStore.deleteTrade(id)
      const tradeRemove = tradeStore.listUserTrade.findIndex(trade => trade.id === id)

      if(tradeRemove !== -1){
        tradeStore.listUserTrade.splice(tradeRemove, 1)
      }
      notification.success('Solicitação de troca deletada com sucesso')
    } catch {
      notification.error('Erro ao excluir solicitação do usuário')
    }
  })
}
</script>
