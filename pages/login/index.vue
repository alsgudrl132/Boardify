<template>
  <div
    v-if="this.$store.state.isLogIn"
    class="d-flex justify-content-center align-items-center"
    style="height: 100vh"
  >
    <p>{{ this.$store.state.userInfo.email }}님 이미 로그인되었습니다</p>
  </div>
  <div
    v-else
    class="d-flex justify-content-center align-items-center"
    style="height: 100vh"
  >
    <div class="text-center">
      <b-form-input
        placeholder="Enter your email"
        class="mb-2"
        v-model="user.email"
      ></b-form-input>
      <b-form-input
        type="password"
        v-model="user.password"
        placeholder="Enter your password"
        class="mb-2"
        @keypress.enter="login"
      ></b-form-input>

      <div class="row d-flex justify-content-center">
        <b-button variant="primary" class="col-5 mr-1" @click="login"
          >로그인</b-button
        >
        <b-button class="col-5 ml-1" @click="cancel">취소</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import jwt from "jsonwebtoken";
import axios from "axios";
import store from "@/store/index.js";
export default {
  store: store,
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
    };
  },

  methods: {
    login() {
      axios
        .get("http://localhost:3003/users")
        .then((res) => {
          const findEmailPassword = res.data.find(
            (user) =>
              user.email === this.user.email &&
              user.password === this.user.password
          );

          if (findEmailPassword) {
            const token = jwt.sign(
              { email: this.user.email },
              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            localStorage.setItem("authToken", token);
            localStorage.setItem("email", this.user.email);
            this.$store.dispatch("logIn");
            alert("로그인 되었습니다.");
            this.$router.push("/");
          } else {
            alert("이메일 또는 비밀번호를 확인해주세요");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    cancel() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped></style>
