<template>
  <div v-if="isLoading">
    <Loading />
  </div>
  <div v-else-if="emailCheck">
    <div
      class="d-flex justify-content-center align-items-center"
      style="height: 100vh"
    >
      <div class="text-center">
        <b-form-input
          placeholder="Enter your email"
          class="mb-2"
          v-model="user.email"
          readonly
        ></b-form-input>
        <b-form-input
          type="password"
          v-model="user.password"
          placeholder="Enter your password"
          class="mb-2"
        ></b-form-input>
        <b-form-input
          type="text"
          v-model="user.name"
          placeholder="이름"
          class="mb-2"
        ></b-form-input>
        <b-form-input
          type="date"
          v-model="user.date"
          class="mb-2"
        ></b-form-input>
        <b-form-input
          type="text"
          v-model="user.phone"
          placeholder="010-0000-0000"
          class="mb-2"
        ></b-form-input>
        <div class="row d-flex justify-content-center">
          <b-button variant="primary" class="col-5 ml-1" @click="register"
            >수정</b-button
          >
          <b-button class="col-5 ml-1" @click="cancel">취소</b-button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="d-flex justify-content-center align-items-center"
    style="height: 100vh"
    v-else-if="isError"
  >
    <strong>잘못된 경로입니다</strong>
  </div>
</template>

<script>
import store from "@/store/index.js";
import axios from "axios";
import jwt from "jsonwebtoken";

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
      this.$router.push("/login");
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

      axios
        .put(
          `http://localhost:3003/users/${this.$route.params.id}`,
          {
            email: this.user.email,
            password: this.user.password,
            name: this.user.name,
            date: this.user.date,
            phone: this.user.phone,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            alert("회원정보가 업데이트되었습니다.");
            this.$store.commit("logOut");
            localStorage.setItem("email", this.user.email);
            this.$store.commit("logIn");
            this.$router.push("/");
          } else {
            console.log(res);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    async initUserData() {
      this.isLoading = true;
      const token = localStorage.getItem("authToken");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3003/users/${this.$route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.user = res.data;
        const email = res.data.email;
        this.$store.dispatch("emailCheck", email);
        this.isLoading = false;
      } catch (error) {
        this.isError = true;
        console.error("Failed to fetch data:", error);
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
