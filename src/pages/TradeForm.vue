<template>
  <div class="q-pa-md">
    <h5 class="q-mb-sm text-secondary text-bold">Solicitar Troca</h5>

    <div v-if="!cardStore.listUserCards.length">
      <div class="col-12 col-md-6 flex flex-center bg-grey-2 q-pa-md q-pt-lg">
        <div class="text-center">
          <q-img
            src="/undraw/empty-icon.svg"
            class="q-mx-auto q-mb-md"
            style="max-width: 300px"
            contain
          />
          <h4 class="text-secondary text-bold q-mb-sm">Você não possui cartas!</h4>
          <p class="text-grey-darken-1">Clique agora em <strong><router-link class="text-secondary" :to="{ name: 'card' }">Cartas</router-link></strong> e adicione cartas a sua conta</p>
        </div>
      </div>
    </div>

    <q-stepper v-else v-model="step" ref="stepperRef" color="secondary" animated>
      <q-step
        :name="1"
        title="Oferecendo"
        caption="Cartas do seu perfil que deseja oferecer"
        icon="add"
        :done="step > 1"
      >
        <div class="flex justify-between q-mb-md" style="align-items: center">
          <div style="width: 60%">
            <q-input
              color="secondary q-mb-lg"
              v-model="search"
              label="Buscar"
              style="max-width: 600px"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div>
            <q-btn
              @click="step === 2 ? createTrade() : stepperRef?.next()"
              color="secondary"
              :label="step === 2 ? 'Finalizar' : 'Avançar'"
              :disable="selectedOfferingCards.length == 0"
            >
              <q-tooltip v-if="selectedOfferingCards.length == 0">
                Selecione no mínimo 1 carta
              </q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div v-if="cardStore.isLoading">
            <LoadingComponent />
          </div>

          <div
            v-else
            v-for="card in filteredUserCards"
            :key="card.id"
            class="col-12 col-sm-6 col-md-4 col-lg-4"
          >
            <q-card
              flat
              bordered
              class="full-height q-pa-md"
              :class="{ 'card-selected': isCardOffering(card.id) }"
            >
              <q-img :src="card.imageUrl" height="350px" ratio="16/9" />

              <q-card-section>
                <div class="text-h6 q-mb-sm ellipsis-2-lines" style="min-height: 60px">
                  {{ card.name }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions class="flex justify-between">
                <q-btn
                  flat
                  round
                  dense
                  @click="toggleCardOffering(card.id)"
                  :color="isCardOffering(card.id) ? 'positive' : 'grey-7'"
                >
                  <q-icon :name="isCardOffering(card.id) ? 'check_circle' : 'add_circle_outline'" />
                  <q-tooltip>
                    {{ isCardOffering(card.id) ? 'Remover oferta' : 'Oferecer carta' }}
                  </q-tooltip>
                </q-btn>

                <q-btn flat color="secondary" label="Mais detalhes" @click="viewCard(card)" />
              </q-card-actions>

              <q-badge
                v-if="isCardOffering(card.id)"
                floating
                rounded
                color="positive"
                label="Oferecendo"
                style="margin-top: 4px; margin-right: 2px"
              />
            </q-card>
          </div>
        </div>
      </q-step>

      <q-step
        :name="2"
        title="Solicitando"
        caption="Cartas que você deseja receber"
        icon="login"
        :done="step > 2"
      >
        <div class="flex justify-between q-mb-md" style="align-items: center">
          <div style="width: 60%">
            <q-input
              color="secondary q-mb-lg"
              v-model="search"
              label="Buscar"
              style="max-width: 600px"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div>
            <q-btn
              v-if="step > 1"
              flat
              color="secondary"
              @click="stepperRef?.previous()"
              label="Voltar"
              class="q-ml-sm"
            />

            <q-btn
              @click="step === 2 ? createTrade() : stepperRef?.next()"
              color="secondary"
              :label="step === 2 ? 'Finalizar' : 'Avançar'"
              :disable="selectedReceivingCards.length == 0"
            >
              <q-tooltip v-if="selectedReceivingCards.length == 0">
                Selecione no mínimo 1 carta
              </q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div v-if="cardStore.isLoading">
            <LoadingComponent />
          </div>

          <div
            v-else
            v-for="card in filteredCards"
            :key="card.id"
            class="col-12 col-sm-6 col-md-4 col-lg-4"
          >
            <q-card
              flat
              bordered
              class="full-height q-pa-md"
              :class="{ 'card-selected': isCardReceiving(card.id) }"
            >
              <q-img :src="card.imageUrl" height="350px" ratio="16/9" />

              <q-card-section>
                <div class="text-h6 q-mb-sm ellipsis-2-lines" style="min-height: 60px">
                  {{ card.name }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions class="flex justify-between">
                <q-btn
                  flat
                  round
                  dense
                  @click="toggleCardReceiving(card.id)"
                  :color="isCardReceiving(card.id) ? 'secondary' : 'grey-7'"
                >
                  <q-icon
                    :name="isCardReceiving(card.id) ? 'check_circle' : 'add_circle_outline'"
                  />
                  <q-tooltip>
                    {{ isCardReceiving(card.id) ? 'Remover solicitação' : 'Solicitar carta' }}
                  </q-tooltip>
                </q-btn>

                <q-btn flat color="secondary" label="Mais detalhes" @click="viewCard(card)" />
              </q-card-actions>

              <q-badge
                v-if="isCardReceiving(card.id)"
                floating
                rounded
                color="secondary"
                label="Solicitando"
                style="margin-top: 4px; margin-right: 2px"
              />
            </q-card>
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            @click="step === 2 ? createTrade() : stepperRef?.next()"
            color="secondary"
            :label="step === 2 ? 'Finalizar' : 'Avançar'"
            :disable="
              step === 2 ? selectedReceivingCards.length === 0 : selectedOfferingCards.length === 0
            "
          >
            <q-tooltip
              v-if="
                step === 2 ? selectedReceivingCards.length === 0 : selectedOfferingCards.length == 0
              "
            >
              Selecione no mínimo 1 carta
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="step > 1"
            flat
            color="secondary"
            @click="stepperRef?.previous()"
            label="Voltar"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@/models/Card'
import type { TradeCardRequest } from '@/models/TradeCard'
import { computed, onMounted, ref } from 'vue'
import { useCardsStore } from '@/stores/cardsStore'
import { useQuasar, type QStepper } from 'quasar'
import { useNotification } from '@/composables/useNotification'
import LoadingComponent from '@/components/LoadingComponent.vue'
import { useTradesStore } from '@/stores/tradesStore'
import router from '@/router'

const cardStore = useCardsStore()
const $q = useQuasar()
const notification = useNotification()
const tradeStore = useTradesStore()

const step = ref(1)
const stepperRef = ref<QStepper>()
const search = ref('')
const cards = ref<Card[]>([])
const userCards = ref<Card[]>([])
const formattedDate = ref('')
const tradeIdRef = ref('')

const selectedOfferingCards = ref<TradeCardRequest[]>([])
const selectedReceivingCards = ref<TradeCardRequest[]>([])
const formTrade = ref<TradeCardRequest[]>([])

const filteredUserCards = computed(() => {
  if (!search.value) return userCards.value
  return cardStore.listUserCards.filter((card) =>
    card.name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const filteredCards = computed(() => {
  if (!search.value) return cards.value
  return cardStore.listAllCards.filter((card) =>
    card.name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

function isCardOffering(cardId: string) {
  return selectedOfferingCards.value.some(
    (card) => card.cardId === cardId && card.type === 'OFFERING',
  )
}

function isCardReceiving(cardId: string) {
  return selectedReceivingCards.value.some(
    (card) => card.cardId === cardId && card.type === 'RECEIVING',
  )
}

function toggleCardOffering(cardId: string) {
  const index = selectedOfferingCards.value.findIndex(
    (card) => card.cardId === cardId && card.type === 'OFFERING',
  )

  if (index > -1) {
    selectedOfferingCards.value.splice(index, 1)
    notification.info('Carta removida da oferta', 2000)
  } else {
    selectedOfferingCards.value.push({ cardId: cardId, type: 'OFFERING' })
    notification.success('Carta adicionada oferta', 2000)
  }
}

function toggleCardReceiving(cardId: string) {
  const index = selectedReceivingCards.value.findIndex(
    (card) => card.cardId === cardId && card.type === 'RECEIVING',
  )

  if (index > -1) {
    selectedReceivingCards.value.splice(index, 1)
    notification.info('Carta removida da solicitação')
  } else {
    selectedReceivingCards.value.push({ cardId: cardId, type: 'RECEIVING' })
    notification.success('Carta adicionada à solicitação')
  }
}

onMounted(async () => {
  try {
    await cardStore.getUserCards()
    await cardStore.getAllCards()
    userCards.value = cardStore.listUserCards
    cards.value = cardStore.listAllCards
  } catch {
    notification.error('Erro ao buscar cartas')
  }
})

async function createTrade() {
  if (selectedOfferingCards.value.length === 0 || selectedReceivingCards.value.length === 0) {
    notification.error('Selecione pelo menos uma carta para oferecer e uma para solicitar')
    return
  }

  try {
    formTrade.value = [...selectedOfferingCards.value, ...selectedReceivingCards.value]
    const response = await tradeStore.postTrade(formTrade.value)
    tradeIdRef.value = response.tradeId
    tradeStore.page = 1
    await tradeStore.getTrades()
    router.push({
      name: 'trades'
    })
    notification.success('Troca solicitada com sucesso!')
  } catch {
    notification.error('Erro ao solicitar troca de cartas')
  }
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
