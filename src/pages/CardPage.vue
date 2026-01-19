<template>
  <div class="q-pa-md">
    <h5 class="q-mb-sm text-secondary text-bold">Lista de Cartas</h5>
    <q-input color="secondary q-mb-lg" v-model="search" label="Buscar" style="max-width: 400px">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="row q-col-gutter-md">
      <div v-if="cardStore.isLoading">
        <LoadingComponent />
      </div>
      
      <div v-else v-for="card in filteredCards" :key="card.id" class="col-12 col-sm-6 col-md-4 col-lg-4">
        <q-card flat bordered class="full-height q-pa-md">
          <q-img :src="card.imageUrl" height="350px" ratio="16/9" class="" />

          <q-card-section>
            <div class="text-h6 q-mb-sm ellipsis-2-lines" style="min-height: 60px">
              {{ card.name }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" align-content-end column class="justify-between">
            <q-btn flat round dense @click="messageConfirmAddUserList(card.id)">
              <q-icon name="add_circle" />
            </q-btn>

            <q-btn flat color="secondary" label="Mais detalhes" @click="viewCard(card)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="q-mt-lg flex flex-center">
      <q-pagination
        v-model="cardStore.page"
        color="teal"
        :max="cardStore.totalPages"
        :max-pages="6"
        direction-links
        @update:model-value="setPagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingComponent from '@/components/LoadingComponent.vue'
import { useNotification } from '@/composables/useNotification'
import type { Card } from '@/models/Card'
import { useCardsStore } from '@/stores/cardsStore'
import { useQuasar } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'

const $q = useQuasar()
const cardStore = useCardsStore()
const notification = useNotification()

const cards = ref<Card[]>([])
const formattedDate = ref('')
const search = ref('')

const filteredCards = computed(() => {
  if (!search.value) return cards.value
  return cardStore.listAllCards.filter((card) =>
    card.name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

watch(search, () => {
  if (cardStore.listAllCards.length == 0) {
    cardStore.getAllCards()
  }
})

onMounted(async () => {
  try {
    await cardStore.getCards()
    cards.value = cardStore.listCards
  } catch (error) {
    notification.error('Erro ao buscar cartas')
    console.error(error)
  }
})

async function setPagination(newPage: number) {
  cardStore.page = newPage
  try {
    await cardStore.getCards()
    cards.value = cardStore.listCards
  } catch (error) {
    notification.error('Erro ao buscar cartas')
    console.error(error)
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

function messageConfirmAddUserList(idCard: string) {
  if (cardStore.listUserCards.length == 0) {
    cardStore.getUserCards()
  }

  if (cardStore.listUserCards.find((card) => idCard == card.id)) {
    $q.dialog({
      title: 'Você já possui essa carta!',
      message: 'Está carta já está na sua lista, para conferir vá até seu perfil',
    })
    return
  }

  $q.dialog({
    title: 'Deseja adicionar esta carta ao seu perfil?',
    message: 'Está carta vai ser adicionada na sua lista, para conferir vá até seu perfil',
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
      await cardStore.postUserCard(idCard)
      notification.success('Carta adicionada ao perfil do usuário')
    } catch (error) {
      notification.error('Erro ao adicionar carta ao usuário')
      console.error(error)
    }
  })
}
</script>
