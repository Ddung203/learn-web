<script setup lang="ts"></script>

<template>
  <div class="container">
    <img
      src="https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2F404_page.jpg?alt=media&token=0530785b-e00a-456c-947d-2c54004d9e04"
      alt="Page not found!"
    />
  </div>
</template>

<style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .container {
    min-width: 100vw;
    max-width: 100vw;
    max-height: 100vh;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    background-color: #fff !important;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
</style>
