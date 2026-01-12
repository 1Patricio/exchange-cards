<template>
  <q-page>
    <div class="row" style="height: 100dvh;">
      <div class="col-12 col-md-6 flex flex-center bg-grey-4 q-pa-md">
        <div class="text-center">
          <q-img
            src="/undraw/login-icon.svg"
            class="q-mx-auto q-mb-md"
            style="max-width: 300px"
            contain
          />
          <h4 class="text-secondary">Cards Marketlace</h4>
          <p class="text-grey-darken-1">Plataforma de trocas de cartas</p>
        </div>
      </div>
      <div class="col-12 col-md-6 flex flex-center text-center">
        <div class="q-pa-md" style="width: 100%;">
          <q-form
            style="max-width: 500px; margin: auto;"
            class="q-glutter-md"
          >
            <div class="text-center q-mb-6">
              <h1 class="text-secondary">Login</h1>
              <p class="text-grey">Preencha seus dados para logar</p>
            </div>

            <q-input
              outlined
              v-model="text"
              label="Email"
              class="q-mb-md"
            />

            <q-input
              outlined
              type="password"
              label="Senha"
              v-model="text"
              class="q-mb-lg"
            />

            <q-btn block class="q-mb-sm" color="secondary" size="large" type="submit">
              Entrar
            </q-btn>

            <div class="text-center q-mb-sm">
              ou
            </div>

            <q-btn
              :to="{ name: 'register' }"
              block
              outline
              color="primary"
              size="large"
              class="q-mb-sm"
            >
              Cadastre-se
            </q-btn>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';


const text = ref('')
</script>
