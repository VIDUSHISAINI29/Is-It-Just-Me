<script setup>
   import { onMounted } from 'vue';
   import Toast from 'primevue/toast';
   import '../src/assets/tailwind.css';
   onMounted(() => {
      console.log('In App');
   });
</script>

<template>
   <router-view />
    <Toast/>
</template>

<style scoped></style>
