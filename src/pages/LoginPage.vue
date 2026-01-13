<template>
  <q-page>
    <div class="row" style="height: 100dvh;">
      <div class="col-12 col-md-6 flex flex-center bg-grey-2 q-pa-md">
        <div class="text-center">
          <q-img
            src="/undraw/login-icon.svg"
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
              <h2 class="text-secondary text-bold q-mb-sm">Login</h2>
              <p class="text-grey">Faça o login na sua conta!</p>
            </div>

            <q-input
              outlined
              hide-bottom-space
              v-model="email"
              label="Email"
              class="q-mb-md"
              :rules="[val => requiredField(val, 'Email'), val => emailRule(val)]"
            />

            <q-input
              outlined
              hide-bottom-space
              :type="passwordIsVisible ? 'text' : 'password'"
              v-model="password"
              class="q-mb-lg"
              label="Senha"
              :rules="[val => requiredField(val, 'Senha'), val => minLength(val, 6, 'Senha')]"
            >
            <template v-slot:append>
              <q-icon
                :name="passwordIsVisible ? 'visibility' : 'visibility_off'"
                @click="showPassword"
              />
            </template>
            </q-input>

            <q-card-section v-if="error" class="text-center q-pa-none">
             <p class="text-red-6">{{ error }}</p>
            </q-card-section>

            <q-btn
              block
              unelevated
              color="secondary"
              size="large"
              style="width: 100%;"
              class="q-mb-sm"
              label="Entrar"
              :disable="isDisabled"
              @click="handleSubmit()"
            />

            <div class="text-center q-mb-sm">
              ou
            </div>

            <q-btn
              :to="{ name: 'register' }"
              block
              outline
              color="primary"
              size="large"
              style="width: 100%;"
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
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const router = useRouter()

const email = ref('');
const password = ref('');

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.){3}[0-9]{1,3}|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const error = ref<string | null>(null)

const isDisabled = computed(() => {
  if (!email.value) return true
  if (!password.value) return true
  if (password.value.length < 6) return true
  if (!isValidEmail(email.value)) return true

  return false
})

async function handleSubmit() {
  error.value = null
  try {
    await auth.login(email.value, password.value)
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

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

function emailRule(val: string) {
  return isValidEmail(val) || 'Email inválido'
}

const passwordIsVisible = ref(false)
function showPassword() {
  passwordIsVisible.value = !passwordIsVisible.value
}
</script>
