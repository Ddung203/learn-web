<script setup lang="ts">
  import Header from '~/components/Header.vue';
</script>

<template>
  <Header></Header>
  <div>
    <div class="w-full h-[300px] back"></div>
  </div>
  <div class="p-[20px]">
    <p class="text-3xl text-[#ffab32] font-semibold text-center">
      Chúc mừng bạn đã hoàn thành bài kiểm tra
    </p>
  </div>

  <div class="lg:px-[200px] px-[20px] mt-10 mb-14 lg:mb-0">
    <router-link to="/introduction">
      <Button class="flex items-center justify-center w-full"
        >Quay về Trang chủ</Button
      >
    </router-link>
  </div>
</template>

<style scoped>
  .back {
    background-image: url('https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/others%2FExam1-01.png?alt=media&token=5a4281d6-6a71-45ff-bdd9-a4ba84d5c7d3');
    background-size: cover;
    background-position: center;
  }

  .bs-1 {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    padding: 20px 30px;
  }

  .inner {
    padding: 20px 30px;
  }
</style>
