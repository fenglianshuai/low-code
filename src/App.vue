<template>
  <Editor v-model="state"></Editor>
</template>

<script setup>
import { provide, ref } from 'vue'
import data from './data.json';
import Editor from './views/editor';
import { registerConfig as config } from './components/editor-config';

provide('config', config);
const state = ref(data);

</script>

<style scoped></style>
