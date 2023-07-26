<template>
  <Editor v-model="state" :formData="formData"></Editor>
</template>

<script setup>
import { provide, reactive, ref } from 'vue'
import data from './data.json';
import Editor from './views/editor';
import { registerConfig as config } from './components/editor-config';

provide('config', config);
const state = ref(data);
const formData = reactive({
  default: '123123',
  start: 0,
  end: 100
})
</script>

<style scoped></style>
