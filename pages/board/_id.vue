<template>
  <div class="board-detail">
    <b-container fluid>
      <b-row class="mb-3">
        <b-col>
          <h2 class="board-title">게시글 상세</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card class="board-card">
            <b-form>
              <b-form-group label="제목">
                <b-form-input
                  v-model="boardDataById.title"
                  :readonly="!this.$store.state.isAuth"
                ></b-form-input>
              </b-form-group>
              <b-form-group label="내용">
                <b-form-textarea
                  v-model="boardDataById.content"
                  rows="6"
                  :readonly="!this.$store.state.isAuth"
                ></b-form-textarea>
              </b-form-group>
              <div class="mt-3">
                <b-button
                  v-if="this.$store.state.isAuth"
                  variant="primary"
                  @click="updateBoard"
                  >수정</b-button
                >
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
import jwt from "jsonwebtoken";
import { supabase } from "~/plugins/supabase.js";

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
      const { error } = await supabase
        .from("boards")
        .update({
          title: this.boardDataById.title,
          content: this.boardDataById.content,
          date: new Date(Date.now()),
        })
        .eq("id", this.$route.params.id)
        .single();
      if (error) {
        throw error;
      } else {
        alert("게시글 정보가 업데이트되었습니다.");
        this.$router.push("/board");
      }
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

<style>
.board-detail {
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
