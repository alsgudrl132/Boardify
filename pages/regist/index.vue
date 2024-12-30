<template>
  <div class="register-container">
    <div v-if="this.$store.state.isLogIn" class="already-logged-in">
      <b-alert show variant="info">
        {{ this.$store.state.userInfo.email }}님 이미 로그인되었습니다
      </b-alert>
    </div>
    <b-card v-else class="register-card">
      <h2 class="text-center mb-4">회원가입</h2>
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
          </div>
          <span :class="{ green: isRegexMatched, red: !isRegexMatched }">{{
            regexMessage
          }}</span>
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
          <span
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
            class="mb-5"
            :type="teamPasswordInputType"
            v-model="user.teamPassword"
          />
        </div>
        <div class="d-flex justify-content-between">
          <b-button type="submit" variant="primary" class="px-4"
            >회원가입</b-button
          >
          <b-button variant="outline-secondary" @click="cancel" class="px-4"
            >취소</b-button
          >
        </div>
      </b-form>
      <div class="text-center mt-3">
        <p>
          이미 계정이 있으신가요?
          <b-link to="/login" class="login-link">로그인하기</b-link>
        </p>
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
        if (this.user.team !== "") {
          const { data: teamData, error: teamError } = await supabase
            .from("teams")
            .select("password")
            .eq("team", this.user.team);

          if (teamError) throw teamError;

          if (teamData[0].password === this.user.teamPassword) {
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
                team: this.user.team,
              },
            ]);
            if (insertError) throw insertError;
          } else {
            this.$bvToast.toast("팀 비밀번호를 확인해주세요.", {
              title: "오류",
              variant: "danger",
              solid: true,
            });
            return;
          }
        } else {
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
              team: null,
            },
          ]);
          if (insertError) throw insertError;
        }

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
.register-card {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.card-body {
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
