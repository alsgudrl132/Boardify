<template>
  <div class="ml-5 mr-5 mt-5">
    <b-button
      variant="primary"
      v-if="this.$store.state.isLogIn"
      class="btn btn-primary mb-3"
      @click="regist"
      >글 작성</b-button
    ><b-form-checkbox
      v-if="this.$store.state.isLogIn"
      v-model="checked"
      name="check-button"
      @change="getIsChecked"
      switch
    >
      내 글 보기
    </b-form-checkbox>
    <b-table
      :items="this.$store.state.boardData"
      :per-page="perPage"
      :current-page="currentPage"
      class="mt-3"
    >
      <template #cell(title)="data">
        <NuxtLink :to="'/board/' + data.item.id">
          {{ data.item.title }}
        </NuxtLink>
      </template>
      <template #cell(content)="data">
        <NuxtLink :to="'/board/' + data.item.id">
          {{ data.item.content }}
        </NuxtLink>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
    ></b-pagination>
  </div>
</template>

<script>
export default {
  computed: {
    rows() {
      return this.$store.state.boardData.length;
    },
  },
  data() {
    return {
      checked: false,
      perPage: 10,
      currentPage: 1,
    };
  },

  mounted() {
    this.$store.dispatch("getBoardData", this.checked);
  },
  methods: {
    regist() {
      this.$router.push("/board/regist");
    },
    getIsChecked() {
      this.$store.dispatch("getBoardData", this.checked);
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
