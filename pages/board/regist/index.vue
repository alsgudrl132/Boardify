<template>
  <div class="board-regist">
    <b-container fluid>
      <b-row class="mb-3">
        <b-col>
          <h2 class="board-title">새 게시글 작성</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card class="board-card">
            <b-form @submit.prevent="addBoard">
              <b-form-group label="제목">
                <b-form-input v-model="title" required></b-form-input>
              </b-form-group>
              <b-form-group label="내용">
                <b-form-textarea
                  v-model="content"
                  rows="6"
                  required
                ></b-form-textarea>
              </b-form-group>
              <div class="mt-3">
                <b-button type="submit" variant="primary">등록</b-button>
                <b-button variant="secondary" @click="cancel" class="ml-2"
                  >취소</b-button
                >
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "",
      content: "",
      email: "",
    };
  },
  methods: {
    addBoard() {
      const boardData = {
        title: this.title,
        content: this.content,
        email: localStorage.getItem("email"),
      };
      this.$store.dispatch("addBoard", boardData);
      this.$router.push("/board");
    },
    cancel() {
      this.$router.push("/board");
    },
  },
};
</script>

<style>
.board-regist {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.board-title {
  color: #172b4d;
  font-weight: 600;
}

.board-card {
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
}
</style>
