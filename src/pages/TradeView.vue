<template>
  <div class="q-pa-md">
    <header class="collumn">
      <q-btn
        color="secondary"
        class="row"
        :to="{name: 'trades'}"
        style="max-width: 130px;"
        icon="arrow_back"
        label="Voltar"
      />
      <h5 class="q-my-sm text-secondary text-bold">Troca de Cartas</h5>
      <p class="text-grey-10">Troca solicitada por {{ trade?.user.name }} no dia {{ dateTrade }}</p>
    </header>
  </div>

  <div v-if="tradeStore.isLoading">
    <LoadingComponent />
  </div>

  <div class="q-mx-lg row flex justify-around no-wrap" style="align-items: center; height: 25px; ">
    <h6 class="text-red-7 text-bold">Oferencendo</h6>
    <q-icon
      name="compare_arrows"
      size="lg"
    />
    <h6 class="text-green-7 text-bold">Recebendo</h6>
  </div>

  <div class="q-ma-md row no-wrap">
    <q-scroll-area
      visible
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
      :horizontal-thumb-style="{ display: 'none' }"
      :horizontal-bar-style="{ display: 'none' }"
      :style="$q.screen.xs ? 'height: 50dvh;' : 'height: 60dvh;'"
      class="col"
      ref="firstRef"
      @scroll="onScrollFirst"
    >
      <div v-for="card in cardsOffering" :key="card.id" class="q-pa-sm">
        <q-card flat bordered class="q-pa-md q-ma-lg">
          <q-img :src="card.imageUrl" :height="$q.screen.xs ? '180px' : '400px'" ratio="16/9" class="" />
          <q-card-section>
            <div :class="$q.screen.xs ? 'ellipsis-2-lines' :'text-h6 q-mb-sm ellipsis-2-lines'" :style="$q.screen.xs ? 'min-height: 10px' : 'min-height: 60px'">
              {{ card.name }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" align-content-end column>
            <q-btn flat color="secondary" label="Mais detalhes" @click="viewCard(card)" />
          </q-card-actions>
        </q-card>
      </div>
    </q-scroll-area>

    <q-scroll-area
      visible
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
      :horizontal-thumb-style="{ display: 'none' }"
      :horizontal-bar-style="{ display: 'none' }"
      :style="$q.screen.xs ? 'height: 50dvh;' : 'height: 60dvh;'"
      class="col"
      ref="secondRef"
      @scroll="onScrollSecond"
    >
      <div v-for="card in cardsReceiving" :key="card.id" class="q-pa-sm">
        <q-card flat bordered class="q-pa-md q-ma-lg">
          <q-img :src="card.imageUrl" :height="$q.screen.xs ? '180px' : '400px'" ratio="16/9" class="" />
          <q-card-section>
            <div :class="$q.screen.xs ? 'ellipsis-2-lines' :'text-h6 q-mb-sm ellipsis-2-lines'" :style="$q.screen.xs ? 'min-height: 10px' : 'min-height: 60px'">
              {{ card.name }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" align-content-end column>
            <q-btn flat color="secondary" label="Mais detalhes" @click="viewCard(card)" />
          </q-card-actions>
        </q-card>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import LoadingComponent from '@/components/LoadingComponent.vue'
import { useNotification } from '@/composables/useNotification'
import type { Card } from '@/models/Card'
import type { Trade } from '@/models/Trade'
import type { TradeCard } from '@/models/TradeCard'
import { useTradesStore } from '@/stores/tradesStore'
import { useQuasar, type VueStyleProp } from 'quasar'
import {  onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const tradeStore = useTradesStore()
const router = useRouter()
const route = useRoute()
const notification = useNotification()
const $q = useQuasar()

const trade = ref<Trade | null>()
const firstRef = ref<any>(null)
const secondRef = ref<any>(null)
const tradeCards = ref<TradeCard[]>()
const cardsOffering = ref<Card[]>([])
const cardsReceiving = ref<Card[]>([])
const formattedDate = ref('')
const dateTrade = ref('')
const idTrade = ref<string | undefined>('')

let ignoreSource: 'first' | 'second' | null = null

const thumbStyle: Partial<CSSStyleDeclaration> = {
  borderRadius: '7px',
  backgroundColor: '#027be3',
  width: '4px',
  opacity: '0.75'
}

const barStyle: VueStyleProp = {
  borderRadius: '9px',
  backgroundColor: '#027be3',
  width: '8px',
  opacity: '0.2'
}

onMounted(async () => {
  idTrade.value = route.params.id?.toString()

  if (!idTrade.value) {
    notification.error("Solicitação de troca não encontrada")
    router.push({ name: 'trades' })
    return
  }

  try {
    if(!tradeStore.selectedTrade) {
      await tradeStore.getTradesById(idTrade.value)
    }

    trade.value = tradeStore.selectedTrade

    if (!trade.value) {
      notification.error("Solicitação de troca não encontrada")
      router.push({ name: 'trades' })
      return
    }

    const dateTradeString = new Date(trade.value.createdAt)
    dateTrade.value = dateTradeString.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    tradeCards.value = trade.value!.tradeCards
    setListCard()
  } catch {
    notification.error("Não foi possível abrir visualização da troca selecionada")
    router.push({name: 'trades'})
  }
})

function setListCard() {
  for (let index = 0; index < tradeCards.value!.length; index++) {
    if(tradeCards.value![index]?.type === "OFFERING"){
      cardsOffering.value.push(tradeCards.value![index]!.card)
    } else {
      cardsReceiving.value.push(tradeCards.value![index]!.card)
    }
  }
}

function scroll(source: 'first' | 'second', position: number) {
  if (ignoreSource === source) {
    ignoreSource = null
    return
  }

  ignoreSource = source === 'first'
    ? 'second'
    : 'first'

  const areaRef = source === 'first'
    ? secondRef
    : firstRef

  areaRef.value?.setScrollPosition('vertical', position)
}

function onScrollFirst({ verticalPosition }: { verticalPosition: number }) {
  scroll('first', verticalPosition)
}

function onScrollSecond({ verticalPosition }: { verticalPosition: number }) {
  scroll('second', verticalPosition)
}

function viewCard(card: Card) {
  const date = new Date(card.createdAt)
  formattedDate.value = date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  $q.dialog({
    persistent: true,
    html: true,
    style:
      'width: 540px; height: 620px; display: flex; flex-direction: column; justify-content: flex-end;',
    title: `<h6 class="text-center q-ma-md">${card.name}</h6> <hr/>`,
    message: `
    <div style = "height: 440px">
      <img src="${card.imageUrl}" style="height: 350px; text-align: center"/>
      <br />
      <div style = "margin-bottom: 20px; word-break: break-word;">
        <b>Descrição:</b> ${card.description}
      </div>
      <div>
        <hr/>
        <div style = "font-style: italic; color: grey; align-items: end;">
          Criado em ${formattedDate.value}
        </div>
      </div>
    </div>
    `,
    ok: {
      label: 'Fechar',
      color: 'primary',
    },
  })
}
</script>
