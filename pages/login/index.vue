<template>
  <div class="login-container">
    <div v-if="this.$store.state.isLogIn" class="already-logged-in">
      <b-alert show variant="info">
        {{ this.$store.state.userInfo.email }}님 이미 로그인되었습니다
      </b-alert>
    </div>
    <b-card v-else class="login-card">
      <div class="welcome-message text-center mb-4">
        <h2 class="mb-3">Boardify</h2>
        <p class="text-muted">
          효율적인 협업을 위한 프로젝트 관리 도구입니다.<br />
          팀원들과 함께 프로젝트를 관리하고 소통해보세요.
        </p>
      </div>

      <h3 class="text-center mb-4">로그인</h3>
      <b-button variant="primary" class="w-100 mb-3" @click="testLogin">
        테스트 계정 이용해보기
      </b-button>
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
          <div class="position-relative">
            <b-form-input
              id="password"
              class="password"
              v-model="user.password"
              :type="passwordInputType"
              placeholder="비밀번호를 입력하세요"
              required
            ></b-form-input>
            <img
              v-if="isPasswordHidden"
              :src="require('~/assets/image/eye-close.png')"
              class="eye"
              @click="togglePasswordVisibility('password')"
            />
            <img
              v-else
              :src="require('~/assets/image/eye.png')"
              class="eye"
              @click="togglePasswordVisibility('password')"
            />
          </div>
        </b-form-group>

        <div class="d-flex justify-content-between mb-4">
          <b-button type="submit" variant="primary" class="w-100 mr-2"
            >로그인</b-button
          >
          <b-button
            variant="outline-secondary"
            @click="cancel"
            class="w-100 ml-2"
            >취소</b-button
          >
        </div>
      </b-form>

      <div class="text-center mt-4 registration-section">
        <p class="mb-2">아직 계정이 없으신가요?</p>
        <b-button to="/regist" variant="outline-primary" class="w-100">
          새로운 계정 만들기
        </b-button>
      </div>
    </b-card>
  </div>
</template>

<script>
import jwt from "jsonwebtoken";
import { supabase } from "~/plugins/supabase.js";

export default {
  beforeRouteEnter(to, from, next) {
    if (process.client) {
      const token = localStorage.getItem("authToken");
      if (token) {
        next("/");
      } else {
        next();
      }
    } else {
      next();
    }
  },
  middleware: "auth",
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
      isPasswordHidden: true,
      isTeamPasswordHidden: true,
      passwordInputType: "password",
      teamPasswordInputType: "password",
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
          this.$bvToast.toast("로그인되었습니다.", {
            title: "환영합니다!",
            variant: "success",
            solid: true,
          });
          this.$router.push("/");
        } else {
          this.$bvToast.toast("이메일 또는 비밀번호를 확인해주세요", {
            title: "로그인 실패",
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
    testLogin() {
      this.user.email = "test@test.com";
      this.user.password = "qwer1234!!";
    },
    cancel() {
      this.$router.push("/");
    },
    togglePasswordVisibility(field) {
      if (field === "password") {
        this.isPasswordHidden = !this.isPasswordHidden;
        this.passwordInputType = this.isPasswordHidden ? "password" : "text";
      } else if (field === "teamPassword") {
        this.isTeamPasswordHidden = !this.isTeamPasswordHidden;
        this.teamPasswordInputType = this.isTeamPasswordHidden
          ? "password"
          : "text";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.welcome-message {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.welcome-message h2 {
  color: #2c3e50;
  font-weight: 600;
}

.welcome-message p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
}

.already-logged-in {
  max-width: 400px;
  width: 100%;
}

.position-relative {
  position: relative;
}

.eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.eye:hover {
  opacity: 0.8;
}

.registration-section {
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.registration-section p {
  color: #666;
}

@media screen and (max-width: 767px) {
  .login-card {
    padding: 1.5rem;
  }

  .eye {
    right: 8px;
  }

  .welcome-message {
    padding: 15px 0;
  }
}

@media screen and (max-width: 360px) {
  .login-card {
    padding: 1rem;
  }

  .eye {
    right: 6px;
  }

  .welcome-message h2 {
    font-size: 1.5rem;
  }
}
</style>
