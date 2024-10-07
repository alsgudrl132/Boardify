<template>
  <div class="mypage-container">
    <b-container v-if="isLoading">
      <Loading />
    </b-container>

    <b-container v-else-if="emailCheck" class="py-5">
      <b-card class="mypage-card">
        <h2 class="text-center mb-4">내 정보 수정</h2>
        <b-form @submit.prevent="register">
          <b-form-group label="이메일:" label-for="email">
            <b-form-input
              id="email"
              v-model="user.email"
              readonly
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <b-form-group label="비밀번호:" label-for="password">
            <b-form-input
              id="password"
              v-model="user.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <b-form-group label="이름:" label-for="name">
            <b-form-input
              id="name"
              v-model="user.name"
              placeholder="이름을 입력하세요"
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <b-form-group label="생년월일:" label-for="date">
            <b-form-input
              id="date"
              v-model="user.date"
              type="date"
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <b-form-group label="전화번호:" label-for="phone">
            <b-form-input
              id="phone"
              v-model="user.phone"
              placeholder="010-0000-0000"
              class="mb-2"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex justify-content-between mt-4">
            <b-button type="submit" variant="primary" class="px-4"
              >수정</b-button
            >
            <b-button variant="outline-secondary" @click="cancel" class="px-4"
              >취소</b-button
            >
          </div>
        </b-form>
      </b-card>
    </b-container>

    <b-container v-else-if="isError" class="text-center py-5">
      <b-alert show variant="danger">잘못된 경로입니다</b-alert>
    </b-container>
  </div>
</template>

<script>
import store from "@/store/index.js";
import jwt from "jsonwebtoken";
import { supabase } from "~/plugins/supabase.js";

export default {
  store: store,
  data() {
    return {
      user: {
        email: "",
        password: "",
        name: "",
        date: "",
        phone: "",
      },
      isLoading: false,
      isError: false,
    };
  },
  async mounted() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      this.$router.push("/login");
      return;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      await this.initUserData();
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        this.$bvToast.toast("토큰이 만료되었습니다. 다시 로그인해주세요.", {
          title: "세션 만료",
          variant: "warning",
          solid: true,
        });
        this.$store.dispatch("logOut");
        this.$router.push("/login");
      } else {
        console.error(e);
      }
    }
  },
  methods: {
    cancel() {
      this.$router.push("/");
    },
    async register() {
      const token = localStorage.getItem("authToken");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      try {
        const { error } = await supabase
          .from("users")
          .update({
            email: this.user.email,
            password: this.user.password,
            name: this.user.name,
            date: this.user.date,
            phone: this.user.phone,
          })
          .eq("id", this.$route.params.id)
          .single();

        if (error) throw error;

        this.$bvToast.toast("회원정보가 업데이트되었습니다.", {
          title: "수정 완료",
          variant: "success",
          solid: true,
        });
        localStorage.setItem("email", this.user.email);
        this.$store.commit("logIn");
        this.$router.push("/");
      } catch (error) {
        console.error("Failed to update user:", error.message);
        this.$bvToast.toast("회원정보 업데이트에 실패했습니다.", {
          title: "오류",
          variant: "danger",
          solid: true,
        });
      }
    },
    async initUserData() {
      this.isLoading = true;
      const token = localStorage.getItem("authToken");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      try {
        const { data: users, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", this.$route.params.id)
          .single();

        if (error) throw error;

        this.user = users;
        this.$store.dispatch("emailCheck", users.email);
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
        this.isError = true;
      } finally {
        this.isLoading = false;
      }
    },
  },
  computed: {
    emailCheck() {
      return this.$store.state.emailCheck;
    },
  },
};
</script>

<style scoped>
.mypage-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
}

.mypage-card {
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
