<template>
  <b-modal
    id="add-team-modal"
    title="새 팀 추가"
    @ok="addTeamSubmit"
    ok-title="추가"
    cancel-title="취소"
    class="trello-modal"
    ref="add-team-modal"
  >
    <b-form-group label="팀 제목">
      <div class="d-flex justify-content-between">
        <b-form-input
          v-model="addTeamData.title"
          placeholder="팀 제목을 입력해주세요"
          trim
          maxlength="8"
          class="mb-3 add-team-input"
        ></b-form-input>
        <b-button
          @click="checkTeamTitle"
          variant="primary"
          style="height: calc(1.5em + 0.75rem + 2px)"
          >중복 체크</b-button
        >
      </div>
      <span :class="{ red: isOverlap, green: !isOverlap }">{{
        overlapMessage
      }}</span>
    </b-form-group>
    <b-form-group label="팀 비밀번호">
      <p style="opacity: 50%">
        8~12자의 영문대소문자, 숫자, 특수문자 중 2종류 이상을 조합한 10자리 이상
        또는 3종류이상을 조합한 8자리 이상
      </p>
      <b-form-input
        v-model="addTeamData.password"
        placeholder="팀 비밀번호를 입력해주세요"
        trim
        type="password"
        maxlength="16"
        class="mb-3 add-team-password-input"
        @keyup="checkRegex"
      ></b-form-input>
      <span :class="{ green: isRegexMatched, red: !isRegexMatched }">{{
        regexMessage
      }}</span></b-form-group
    ><b-form-group label="팀 비밀번호 확인"
      ><b-form-input
        v-model="addTeamData.passwordCheck"
        placeholder="팀 비밀번호를 입력해주세요"
        trim
        type="password"
        maxlength="16"
        class="mb-3 add-team-password-input"
        @keyup="checkPassword"
      ></b-form-input
      ><span :class="{ green: isPasswordMatched, red: !isPasswordMatched }">{{
        passwordMessage
      }}</span>
    </b-form-group>
  </b-modal>
</template>

<script>
import { supabase } from "~/plugins/supabase.js";
export default {
  data() {
    return {
      addTeamData: {},
      isRegexMatched: false,
      isPasswordMatched: false,
      isOverlap: false,
      regexMessage: "",
      passwordMessage: "",
      overlapMessage: "",
    };
  },
  methods: {
    checkRegex() {
      const regex =
        /^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}|(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*[a-z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])).{10,})$/;
      this.isRegexMatched = regex.test(this.addTeamData.password);
      this.regexMessage = this.isRegexMatched ? "사용 가능" : "사용 불가";
      this.checkPassword();
    },
    checkPassword() {
      this.isPasswordMatched =
        this.addTeamData.password === this.addTeamData.passwordCheck
          ? true
          : false;
      this.passwordMessage = this.isPasswordMatched ? "일치" : "불일치";
    },
    async checkTeamTitle() {
      try {
        const { data, error } = await supabase.from("teams").select("team");
        if (error) throw error;
        this.isOverlap = data.some(
          (team) => team.team === this.addTeamData.title
        );
        if (
          this.addTeamData.title === "" ||
          this.addTeamData.title === null ||
          this.addTeamData.title === undefined
        ) {
          this.isOverlap = true;
        }

        this.overlapMessage = this.isOverlap
          ? "사용 불가능한 팀명입니다."
          : "사용 가능한 팀명입니다.";
      } catch (error) {
        console.error("팀 정보를 가져오는중 오류가 발생했습니다.", error);
      }
    },
    async addTeamSubmit(e) {
      const alertCode = {
        title: "팀명을 입력해주세요.",
        overlap: "중복 체크를 해주세요.",
        password: "비밀번호를 확인해주세요.",
      };

      if (this.addTeamData.title === "") {
        alert(alertCode.title);
      } else if (this.isOverlap || this.overlapMessage === "") {
        alert(alertCode.overlap);
      } else if (!this.isRegexMatched || !this.isPasswordMatched) {
        alert(alertCode.password);
      } else {
        const params = {
          team: this.addTeamData.title,
          password: this.addTeamData.password,
        };
        console.log(params);
        const { error } = await supabase.from("teams").insert(params);
        if (error) {
          console.error("팀을 등록하는중 오류가 발생했습니다", error);
        } else {
          const { error } = await supabase
            .from("users")
            .update({ team: params.team })
            .eq("email", localStorage.getItem("email"));
          this.$emit("addTeam");
          if (error) {
            console.error(
              "유저정보에 팀을 등록하는중 오류가 발생했습니다",
              error
            );
          }
        }
        this.$refs["add-team-modal"].hide();
        return;
      }
      e.preventDefault();
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

.add-team-input {
  width: 80%;
}
.trello-modal >>> .modal-content {
  border-radius: 3px;
  box-shadow: 0 8px 16px -4px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
}

.trello-modal >>> .modal-header {
  background-color: #f4f5f7;
  border-bottom: 1px solid #dfe1e6;
}

.trello-modal >>> .modal-body {
  background-color: #f4f5f7;
  padding: 20px;
}

.trello-modal >>> .modal-footer {
  background-color: #f4f5f7;
  border-top: 1px solid #dfe1e6;
}
</style>
