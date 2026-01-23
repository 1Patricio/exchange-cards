<template>
  <div class="q-pa-md">
    <div class="flex text-h6 justify-center q-mb-none" style="align-content: center;">
      <p class="text-secondary text-bold">Cartas</p>
      <q-separator vertical spaced size="2px" style="max-height: 32px; color: black;"/>
      <p><router-link class="text-grey-8" :to="{ name: 'profile-trade' }">Trocas</router-link></p>
    </div>
    <h5 class="q-my-sm text-secondary text-bold">Minhas Cartas</h5>

    <div v-if="cardStore.isLoading">
      <LoadingComponent />
    </div>

    <div v-else>
      <div v-if="cardStore.listUserCards.length">
        <q-input
        color="secondary q-mb-lg"
        v-model="search"
        label="Buscar"
        style="max-width: 400px;"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <div class="row q-col-gutter-md">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            class="col-12 col-sm-6 col-md-4 col-lg-4"
          >
            <q-card flat bordered class="full-height q-pa-md">
              <q-img
                :src="card.imageUrl"
                height="350px"
                ratio="16/9"
                class=""
              />

              <q-card-section>
                <div class="text-h6 q-mb-sm ellipsis-2-lines" style="min-height: 60px">
                  {{ card.name }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right" align-content-end column class="justify-between">
                <q-btn
                  flat
                  color="secondary"
                  label="Mais detalhes"
                  @click="viewCard(card)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <div v-else>
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
      
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingComponent from '@/components/LoadingComponent.vue'
import { useNotification } from '@/composables/useNotification'
import type { Card } from '@/models/Card'
import { useCardsStore } from '@/stores/cardsStore'
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'

const $q = useQuasar()
const cardStore = useCardsStore()
const notification = useNotification()

const cards = ref<Card[]>([])
const formattedDate = ref("")
const search = ref("")

const filteredCards = computed(() => {
  if (!search.value) return cards.value
  return cardStore.listUserCards.filter(card =>
    card.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  try {
    await cardStore.getUserCards()
    cards.value = cardStore.listUserCards
  } catch (error) {
    notification.error("Erro ao buscar cartas")
    console.error(error)
  }
})

function viewCard(card: Card) {
  const date = new Date(card.createdAt)
  formattedDate.value = date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  $q.dialog({
    persistent:true,
    html: true,
    style: "width: 540px; height: 620px; display: flex; flex-direction: column; justify-content: flex-end;",
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
