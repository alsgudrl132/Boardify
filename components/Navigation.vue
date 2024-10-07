<template>
  <div>
    <client-only>
      <b-navbar toggleable="lg" type="dark" variant="primary" class="px-4">
        <b-navbar-brand to="/" class="font-weight-bold"
          >Boardify</b-navbar-brand
        >

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item to="/" exact>Home</b-nav-item>
            <b-nav-item to="/board">Board</b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <template v-if="isLogIn">
              <b-nav-item @click="myPage">MyPage</b-nav-item>
              <b-nav-item @click="logOut">LogOut</b-nav-item>
            </template>
            <template v-else>
              <b-nav-item to="/login">LogIn</b-nav-item>
              <b-nav-item to="/regist">Regist</b-nav-item>
            </template>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </client-only>
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

<style scoped>
.navbar-nav .nav-link {
  color: #ffffff !important;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.navbar-nav .nav-link:hover,
.navbar-nav .nav-link:focus {
  color: #ffffff !important;
  font-weight: bold;
  opacity: 1;
}

.navbar-brand {
  letter-spacing: 1px;
}
</style>
