<template>
  <div class="login-container">
    <div v-if="this.$store.state.isLogIn" class="already-logged-in">
      <b-alert show variant="info">
        {{ this.$store.state.userInfo.email }}님 이미 로그인되었습니다
      </b-alert>
    </div>
    <b-card v-else class="login-card">
      <h2 class="text-center mb-4">로그인</h2>
      <b-form @submit.prevent="login">
        <b-form-group id="email-group" label="이메일:" label-for="email">
          <b-form-input
            id="email"
            v-model="user.email"
            type="email"
            placeholder="이메일을 입력하세요"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="password-group"
          label="비밀번호:"
          label-for="password"
        >
          <b-form-input
            id="password"
            v-model="user.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
          ></b-form-input>
        </b-form-group>

        <div class="d-flex justify-content-between">
          <b-button type="submit" variant="primary" class="px-4"
            >로그인</b-button
          >
          <b-button variant="outline-secondary" @click="cancel" class="px-4"
            >취소</b-button
          >
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import jwt from "jsonwebtoken";
import { supabase } from "~/plugins/supabase.js";

export default {
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async login() {
      try {
        const { data: users, error } = await supabase.from("users").select("*");
        if (error) throw error;

        const findEmailPassword = users.find(
          (user) =>
            user.email === this.user.email &&
            user.password === this.user.password
        );

        if (findEmailPassword) {
          const token = jwt.sign(
            { email: this.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          localStorage.setItem("authToken", token);
          localStorage.setItem("email", this.user.email);
          this.$store.dispatch("logIn");
          this.$bvToast.toast("로그인 되었습니다.", {
            title: "성공",
            variant: "success",
            solid: true,
          });
          this.$router.push("/");
        } else {
          this.$bvToast.toast("이메일 또는 비밀번호를 확인해주세요", {
            title: "오류",
            variant: "danger",
            solid: true,
          });
        }
      } catch (error) {
        console.error("로그인 중 오류 발생:", error);
        this.$bvToast.toast("로그인 중 오류가 발생했습니다.", {
          title: "오류",
          variant: "danger",
          solid: true,
        });
      }
    },
    cancel() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.already-logged-in {
  max-width: 400px;
  width: 100%;
}
</style>
