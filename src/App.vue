<template>
  <Editor :data="state"></Editor>
</template>

<script setup>
import { ref } from 'vue'
import data from './data.json';
import Editor from './views/editor'
const state = ref(data);

</script>

<style scoped></style>
