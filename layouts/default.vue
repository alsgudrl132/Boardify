<template>
  <div>
    <Navigation />
    <Nuxt />
  </div>
</template>

<script>
export default {
  async beforeMount() {
    await this.$store.commit("getMemberInfo");
  },
};
</script>
