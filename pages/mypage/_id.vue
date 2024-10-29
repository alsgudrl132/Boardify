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
              >
              </b-form-input>
              <!-- 닫힌모양  -> 누르면 열린모양 -->
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

            <span :class="{ green: isRegexMatched, red: !isRegexMatched }">{{
              regexMessage
            }}</span>
          </b-form-group>

          <b-form-group label="이름:" label-for="name">
            <b-form-input
              id="name"
              v-model="user.name"
              placeholder="이름을 입력하세요"
              class="mb-2"
              maxlength="20"
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
              required
              @keyup="checkPhoneRegexThisComponent"
            ></b-form-input
            ><span
              :class="{ green: isPhoneRegexMatched, red: !isPhoneRegexMatched }"
              >{{ phoneRegexMessage }}</span
            >
          </b-form-group>
          <b-button variant="primary" class="w-100 mb-3" @click="selectTeam"
            >팀 선택</b-button
          >
          <b-form-input onlyread disabled class="mb-3" v-model="user.team" />
          <div class="position-relative">
            <b-form-input
              placeholder="팀 비밀번호를 입력해주세요."
              :type="teamPasswordInputType"
              class="mb-5"
              v-model="user.teamPassword"
            /><img
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
    <team-modal @noTeam="noTeam" @selectTeam="selectTeamFromModal" />
  </div>
</template>

<script>
import store from "@/store/index.js";
import jwt from "jsonwebtoken";
import TeamModal from "../../components/TeamModal.vue";
import { supabase } from "~/plugins/supabase.js";
import utils from "~/plugins/utility.js";

export default {
  store: store,
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
      isNull: false,
      isLoading: false,
      isError: false,
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
  async mounted() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      this.$router.push("/login");
      return;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      await this.initUserData();
      this.checkRegexThisComponent();
      this.checkPhoneRegexThisComponent();
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

      this.isNull = this.user.team === null;

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
        if (!this.isNull) {
          const { data, teamError } = await supabase
            .from("teams")
            .select("password")
            .eq("team", this.user.team);

          if (
            data.length === 0 ||
            data[0].password !== this.user.teamPassword
          ) {
            this.$bvToast.toast("팀 비밀번호를 확인해주세요.", {
              title: "오류",
              variant: "danger",
              solid: true,
            });
            if (teamError) throw teamError;
            return;
          }
        }

        const updateData = {
          email: this.user.email,
          password: this.user.password,
          name: this.user.name,
          date: this.user.date,
          phone: this.user.phone,
          team: null,
        };

        if (!this.isNull) {
          updateData.team = this.user.team;
        }
        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", this.$route.params.id)
          .single();

        this.$bvToast.toast("회원정보가 업데이트되었습니다.", {
          title: "수정 완료",
          variant: "success",
          solid: true,
        });
        if (error) throw error;

        localStorage.setItem("email", this.user.email);
        this.$store.commit("logIn");
        this.$router.push("/");
      } catch (catchError) {
        console.error("Failed to update user:", catchError.message);
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
    selectTeam() {
      this.$bvModal.show("team-modal");
    },
    selectTeamFromModal(team) {
      this.user.team = team;
    },
    noTeam() {
      this.user.team = null;
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
  computed: {
    emailCheck() {
      return this.$store.state.emailCheck;
    },
  },
};
</script>

<style scoped>
.red {
  color: red;
}
.green {
  color: green;
}
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
}

@media screen and (max-width: 767px) {
  .eye {
    right: 8px;
  }
}

@media screen and (max-width: 360px) {
  .eye {
    right: 6px;
  }
}
</style>
