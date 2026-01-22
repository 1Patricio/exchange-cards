<template>
  <q-layout view="hHh LpR fFf" class="bg-grey-2">

    <q-header class="bg-secondary text-white">
      <q-toolbar style="height: 80px;">
        <q-toolbar-title class="q-ml-lg text-bold">
          <q-avatar class="q-mr-sm">
            <img src="https://cdn-icons-png.flaticon.com/512/2022/2022120.png ">
          </q-avatar>
          Cards Marketplace
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="assignment_ind"
        >
          <q-menu>
            <q-list style="min-width: 170px">
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon :name="authStore.token == null ? 'login' : 'logout'" />
                </q-item-section>

                <q-item-section>
                  {{ authStore.token == null  ? 'Fazer Login' : 'Sair'}}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        {{ nameUserAuth }}

      </q-toolbar>
    </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above

        :mini="miniState"
        @mouseenter="miniState = false"
        @mouseleave="miniState = true"

        :width="200"
        :breakpoint="500"
        bordered
        :class="$q.dark.isActive ? 'bg-secondary' : 'bg-secondary'"
      >
        <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
          <q-list padding>
            <q-item clickable v-ripple :to="{name: 'trades'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="change_circle" color="white"/>
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Trocas
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{name: 'card'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="layers" color="white"/>
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Cartas
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{name: 'profile'}" class="q-mt-sm">
              <q-item-section avatar>
                <q-icon name="account_circle" color="white" />
              </q-item-section>

              <q-item-section class="text-white text-bold">
                Perfil
              </q-item-section>
            </q-item>

          </q-list>
        </q-scroll-area>
      </q-drawer>

    <q-page-container>
      <div class="q-pa-lg q-mx-auto" style="max-width: 1000px;">
        <router-view />
      </div>
    </q-page-container>

  </q-layout>
</template>
<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { useAuthStore } from '@/stores/authStore';
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const notification = useNotification()
const router = useRouter()

const drawer = ref(false);
const miniState = ref(true);
const nameUserAuth = ref('Bem Vindo!')

onMounted(async () => {
  await authStore.getUserCurrent()
  nameUserAuth.value = authStore.user!.name
})

function logout(){
  try {
    authStore.logout()
    router.push({ name: 'login'})
  } catch (error) {
    notification.error('Erro ao fazer logout: ');
    console.error(error)
  }
}
</script>
