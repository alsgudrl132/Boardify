<template>
  <div>
    <div class="ml-5 mr-5 mt-3">
      <label>Title</label>
      <b-form-input
        id="textarea"
        v-model="title"
        rows="1"
        max-rows="1"
      ></b-form-input>
    </div>
    <div class="ml-5 mr-5 mt-3">
      <label>Content</label>
      <b-form-textarea
        id="textarea"
        v-model="content"
        rows="3"
        max-rows="6"
      ></b-form-textarea>
    </div>
    <div class="ml-5 mr-5 mt-3">
      <b-button variant="primary" @click="insertBoard">등록</b-button>
      <b-button variant="secondary" @click="cancel">취소</b-button>
    </div>
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
    insertBoard() {
      const boardData = {
        title: this.title,
        content: this.content,
        email: localStorage.getItem("email"),
      };
      this.$store.dispatch("insertBoard", boardData);
      this.$router.push("/board");
    },
    cancel() {
      this.$router.push("/board");
    },
  },
};
</script>
