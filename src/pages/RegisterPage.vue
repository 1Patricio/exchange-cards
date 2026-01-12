<template>
  <q-page>
    <div class="row" style="height: 100dvh;">
      <div class="col-12 col-md-6 flex flex-center bg-grey-2 q-pa-md">
        <div class="text-center">
          <q-img
            src="/undraw/register-icon.svg"
            class="q-mx-auto q-mb-md"
            style="max-width: 300px"
            contain
          />
          <h4 class="text-secondary text-bold q-mb-sm">Cards Marketlace</h4>
          <p class="text-grey-darken-1">Plataforma de trocas de cartas</p>
        </div>
      </div>
      <div class="col-12 col-md-6 flex flex-center text-center">
        <div class="q-pa-md" style="width: 100%;">
          <q-form
            style="max-width: 500px; margin: auto;"
            class="q-glutter-md"
          >
            <div class="text-center q-mb-lg">
              <h4 class="text-secondary text-bold q-mb-sm">Faça seu cadastro</h4>
              <p class="text-grey">Preencha seus dados para logar</p>
            </div>

            <q-input
              outlined
              v-model="name"
              type="text"
              label="Nome"
              class="q-mb-md"
            />

            <q-input
              outlined
              hide-bottom-space
              v-model="email"
              label="Email"
              class="q-mb-md"
              :rules="[val => requiredField(val, 'Email')]"
            />

            <q-input
              outlined
              hide-bottom-space
              type="password"
              v-model="password"
              class="q-mb-lg"
              label="Senha"
              :rules="[val => requiredField(val, 'Senha'), val => minLength(val, 6, 'Senha')]"
            />

            <q-btn
              block
              color="secondary"
              size="large"
              label="Cadastrar"
              :disable="isDisabled"
              style="width: 100%;"
              class="q-mb-sm"
              @click="handleSubmit()"
            />

            <div class="text-center q-mb-sm">
              ou
            </div>

            <q-btn
              :to="{ name: 'login' }"
              block
              outline
              color="primary"
              size="large"
              style="width: 100%;"
              class="q-mb-sm rounded-borders"
            >
              Tenho uma conta
            </q-btn>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const router = useRouter()

const name = ref('');
const email = ref('');
const password = ref('');

const error = ref<string | null>(null)

const isDisabled = computed(() => {
  const anyEmpty = !email.value || !password.value
  const shortPassword = password.value.length > 0 && password.value.length < 6
  return anyEmpty || shortPassword
})

async function handleSubmit() {
  error.value = null
  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/home')
  } catch (err: any) {
    error.value = err?.message || 'Erro ao autenticar'
  }
}

function requiredField(val: string, fieldName = 'Campo') {
  return val.length > 0 || `${fieldName} é obrigatório`
}

function minLength(val: string, length = 6, fieldName = 'Senha') {
  return val.length >= length || `${fieldName} deve ter no mínimo ${length} caracteres`
}
</script>
