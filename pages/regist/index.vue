<template>
  <div
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
      ></b-form-input
      ><b-form-input
        type="text"
        v-model="user.name"
        placeholder="이름"
        class="mb-2"
      ></b-form-input>
      <b-form-input type="date" v-model="user.date" class="mb-2"></b-form-input>
      <b-form-input
        type="text"
        v-model="user.phone"
        placeholder="010-0000-0000"
        class="mb-2"
      ></b-form-input>
      <div class="row d-flex justify-content-center">
        <b-button variant="primary" class="col-5 ml-1" @click="register"
          >회원가입</b-button
        >
        <b-button class="col-5 ml-1" @click="cancel">취소</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "@/store/index.js";
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
    };
  },
  methods: {
    cancel() {
      this.$router.push("/");
    },
    register() {
      axios
        .get("http://localhost:3003/users")
        .then((res) => {
          const findEmail = res.data.find(
            (user) => user.email === this.user.email
          );
          if (findEmail) {
            alert("중복된 이메일입니다.");
          } else {
            axios
              .post(`http://localhost:3003/users`, {
                email: this.user.email,
                password: this.user.password,
                name: this.user.name,
                date: this.user.date,
                phone: this.user.phone,
              })
              .then((res) => {
                alert("회원가입 되었습니다.");
                this.$router.push("/login");
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => console.log(err));
    },
  },
};
</script>

<style scoped></style>
