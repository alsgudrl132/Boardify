<template>
  <div>
    <div v-if="this.$store.state.isAuth">
      <div class="ml-5 mr-5 mt-3">
        <label>Title</label>
        <b-form-input
          id="textarea"
          v-model="boardDataById.title"
          rows="1"
          max-rows="1"
        ></b-form-input>
      </div>
      <div class="ml-5 mr-5 mt-3">
        <label>Content</label>
        <b-form-textarea
          id="textarea"
          v-model="boardDataById.content"
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
      <div class="ml-5 mr-5 mt-3">
        <b-button variant="primary" @click="updateBoard">수정</b-button>
        <b-button variant="secondary" @click="cancel">취소</b-button>
      </div>
    </div>
    <div v-else>
      <div class="ml-5 mr-5 mt-3">
        <label>Title</label>
        <b-form-input
          id="textarea"
          v-model="boardDataById.title"
          rows="1"
          max-rows="1"
        ></b-form-input>
      </div>
      <div class="ml-5 mr-5 mt-3">
        <label>Content</label>
        <b-form-textarea
          id="textarea"
          v-model="boardDataById.content"
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
      <div class="ml-5 mr-5 mt-3">
        <b-button variant="secondary" @click="cancel">취소</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import jwt from "jsonwebtoken";
export default {
  computed: {
    boardDataById() {
      return { ...this.$store.state.boardData };
    },
  },
  methods: {
    cancel() {
      this.$router.push("/board");
    },
    async updateBoard() {
      await axios
        .patch(
          `http://localhost:3003/board/${this.$route.params.id}`,
          this.boardDataById
        )
        .then((res) => {
          if (res.status === 200) {
            alert("수정되었습니다.");
            this.$router.push("/board");
          } else {
            alert("오류가 발생했습니다.");
          }
        })
        .catch((err) => console.log(err));
    },
  },
  async mounted() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      this.$store.dispatch("getIsAuth", this.$route.params.id);
      this.$store.dispatch("getBoardDataById", this.$route.params.id);
      return;
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      this.$store.dispatch("getIsAuth", this.$route.params.id);
      this.$store.dispatch("getBoardDataById", this.$route.params.id);
    } catch (err) {
      console.log(err);
    }
  },
};
</script>
