<template>
  <div class="register-container">
    <div v-if="this.$store.state.isLogIn" class="already-logged-in">
      <b-alert show variant="info">
        {{ this.$store.state.userInfo.email }}님 이미 로그인되었습니다
      </b-alert>
    </div>
    <b-card v-else class="register-card">
      <div class="welcome-message text-center mb-4">
        <h2 class="mb-3">Boardify</h2>
        <p class="text-muted">
          팀과 함께하는 새로운 시작!<br />
          지금 바로 회원가입하고 시작하세요.
        </p>
      </div>

      <h3 class="text-center mb-4">회원가입</h3>
      <b-form @submit.prevent="register">
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
              v-model="user.password"
              :type="passwordInputType"
              placeholder="비밀번호를 입력하세요"
              required
              v-b-tooltip.focus="
                '8~12자의 영문대소문자, 숫자, 특수문자 중 2종류 이상을 조합한 10자리 이상 또는 3종류 이상을 조합한 8자리 이상'
              "
              @keyup="checkRegexThisComponent"
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
          <small
            :class="{
              'text-success': isRegexMatched,
              'text-danger': !isRegexMatched,
            }"
            class="form-text"
          >
            {{ regexMessage }}
          </small>
        </b-form-group>

        <b-form-group id="name-group" label="이름:" label-for="name">
          <b-form-input
            id="name"
            v-model="user.name"
            type="text"
            placeholder="이름을 입력하세요"
            required
            maxlength="20"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="date-group" label="생년월일:" label-for="date">
          <b-form-input
            id="date"
            v-model="user.date"
            type="date"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group id="phone-group" label="전화번호:" label-for="phone">
          <b-form-input
            id="phone"
            v-model="user.phone"
            type="text"
            placeholder="010-0000-0000"
            required
            @keyup="checkPhoneRegexThisComponent"
          ></b-form-input>
          <small
            :class="{
              'text-success': isPhoneRegexMatched,
              'text-danger': !isPhoneRegexMatched,
            }"
            class="form-text"
          >
            {{ phoneRegexMessage }}
          </small>
        </b-form-group>

        <div class="team-section mb-4">
          <b-button
            variant="outline-primary"
            class="w-100 mb-3"
            @click="selectTeam"
          >
            <i class="fas fa-users mr-2"></i>팀 선택
          </b-button>
          <b-form-input
            readonly
            disabled
            class="mb-3"
            v-model="user.team"
            placeholder="선택된 팀이 없습니다"
          />
          <div v-if="user.team && user.team !== null" class="position-relative">
            <b-form-input
              placeholder="팀 비밀번호를 입력해주세요."
              :type="teamPasswordInputType"
              v-model="user.teamPassword"
              class="mb-3"
            />
            <img
              v-if="isTeamPasswordHidden"
              :src="require('~/assets/image/eye-close.png')"
              class="eye"
              @click="togglePasswordVisibility('teamPassword')"
            />
            <img
              v-else
              :src="require('~/assets/image/eye.png')"
              class="eye"
              @click="togglePasswordVisibility('teamPassword')"
            />
          </div>
        </div>

        <div class="d-flex justify-content-between mb-4">
          <b-button type="submit" variant="primary" class="w-100 mr-2"
            >회원가입</b-button
          >
          <b-button
            variant="outline-secondary"
            @click="cancel"
            class="w-100 ml-2"
            >취소</b-button
          >
        </div>
      </b-form>

      <div class="text-center mt-4 login-section">
        <p class="mb-2">이미 계정이 있으신가요?</p>
        <b-button to="/login" variant="outline-primary" class="w-100">
          로그인하기
        </b-button>
      </div>
    </b-card>
    <team-modal @noTeam="noTeam" @selectTeam="selectTeamFromModal" />
  </div>
</template>
<script>
import { supabase } from "~/plugins/supabase.js";
import TeamModal from "../../components/TeamModal.vue";
import utils from "~/plugins/utility.js";

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
  components: {
    TeamModal,
  },
  data() {
    return {
      user: {
        email: "",
        password: "",
        name: "",
        date: "",
        phone: "",
        team: "",
        teamPassword: "",
      },
      isRegexMatched: false,
      regexMessage: "",
      isPhoneRegexMatched: false,
      phoneRegexMessage: "",
      isPasswordHidden: true,
      isTeamPasswordHidden: true,
      passwordInputType: "password",
      teamPasswordInputType: "password",
    };
  },
  methods: {
    async register() {
      try {
        if (this.isRegexMatched === false) {
          this.$bvToast.toast("비밀번호를 확인해주세요.", {
            title: "오류",
            variant: "danger",
            solid: true,
          });
          return;
        } else if (this.isPhoneRegexMatched === false) {
          this.$bvToast.toast("핸드폰번호를 확인해주세요.", {
            title: "오류",
            variant: "danger",
            solid: true,
          });
          return;
        }

        const { data: existingUsers, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", this.user.email);

        if (fetchError) throw fetchError;

        if (existingUsers.length > 0) {
          this.$bvToast.toast("이미 존재하는 이메일입니다.", {
            title: "오류",
            variant: "danger",
            solid: true,
          });
          return;
        }

        if (this.user.team && this.user.team !== null) {
          const { data: teamData, error: teamError } = await supabase
            .from("teams")
            .select("password")
            .eq("team", this.user.team);

          if (teamError) throw teamError;

          if (teamData[0].password !== this.user.teamPassword) {
            this.$bvToast.toast("팀 비밀번호를 확인해주세요.", {
              title: "오류",
              variant: "danger",
              solid: true,
            });
            return;
          }
        }

        const { user, error } = await supabase.auth.signUp({
          email: this.user.email,
          password: this.user.password,
        });

        if (error) throw error;

        const { error: insertError } = await supabase.from("users").insert([
          {
            email: this.user.email,
            password: this.user.password,
            name: this.user.name,
            date: this.user.date,
            phone: this.user.phone,
            team: this.user.team || null,
          },
        ]);

        if (insertError) throw insertError;

        this.$bvToast.toast("회원가입이 완료되었습니다.", {
          title: "성공",
          variant: "success",
          solid: true,
        });
        this.$router.push("/login");
      } catch (error) {
        console.error("회원가입 중 오류 발생:", error);
        this.$bvToast.toast("회원가입 중 오류가 발생했습니다.", {
          title: "오류",
          variant: "danger",
          solid: true,
        });
      }
    },

    cancel() {
      this.$router.push("/");
    },
    selectTeam() {
      this.$bvModal.show("team-modal");
    },
    selectTeamFromModal(team) {
      this.user.team = team;
    },
    noTeam() {
      this.user.team = null;
      this.user.teamPassword = "";
      this.$bvModal.hide("team-modal");
    },
    checkRegexThisComponent() {
      this.isRegexMatched = utils.checkRegex(this.user.password);
      this.regexMessage = utils.checkRegexMessage(this.user.password);
    },
    checkPhoneRegexThisComponent() {
      this.isPhoneRegexMatched = utils.checkPhoneRegex(this.user.phone);
      this.phoneRegexMessage = utils.checkPhoneRegexMessage(this.user.phone);
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
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
  max-width: 500px;
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

.team-section {
  padding: 1.5rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.login-section {
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.login-section p {
  color: #666;
}

.form-text {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

@media screen and (max-width: 767px) {
  .register-card {
    padding: 1.5rem;
  }

  .eye {
    right: 8px;
  }

  .welcome-message {
    padding: 15px 0;
  }

  .team-section {
    padding: 1rem 0;
  }
}

@media screen and (max-width: 360px) {
  .register-card {
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
