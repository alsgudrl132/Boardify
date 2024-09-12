<template>
  <div>
    <client-only>
      <b-nav tabs class="d-flex justify-content-between">
        <b-nav>
          <b-nav-item to="/" exact>Home</b-nav-item>
          <b-nav-item to="/board">Board</b-nav-item>
          <b-nav-item to="/another-link">Another Link</b-nav-item>
        </b-nav>
        <b-nav />
        <b-nav tabs class="d-flex">
          <div v-if="isLogIn === true" class="d-flex">
            <b-nav-item class="ml-auto" @click="myPage">MyPage</b-nav-item>
            <b-nav-item class="ml-auto" @click="logOut">LogOut</b-nav-item>
          </div>
          <b-nav-item v-else to="/login" class="ml-auto">LogIn</b-nav-item>
          <b-nav-item to="/regist" class="ml-auto">Regist</b-nav-item>
        </b-nav>
      </b-nav></client-only
    >
  </div>
</template>

<script>
import store from "@/store/index.js";
export default {
  store: store,

  methods: {
    logOut() {
      alert("로그아웃 되었습니다.");
      this.$store.dispatch("logOut");
      this.$router.push("/login");
    },
    async myPage() {
      await this.$store.dispatch("getUserId");
      if (
        this.userId === undefined ||
        this.userId === null ||
        this.userId === ""
      ) {
        alert("로그인이 필요하여 로그인페이지로 이동합니다.");
        this.$router.push("/login");
      } else {
        this.$router.push(`/mypage/${this.userId}`);
      }
    },
  },
  computed: {
    isLogIn() {
      return this.$store.state.isLogIn;
    },
    userId() {
      return this.$store.state.userId;
    },
  },
};
</script>
