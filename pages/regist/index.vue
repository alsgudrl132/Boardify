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
      ></b-form-input>
      <b-form-input
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
        <b-button variant="primary" class="col-5 ml-1" @click="register">
          회원가입
        </b-button>
        <b-button class="col-5 ml-1" @click="cancel">취소</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from "~/plugins/supabase.js";

export default {
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
    async register() {
      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", this.user.email);

      if (fetchError) {
        console.error(fetchError);
        return;
      }

      if (existingUsers.length > 0) {
        alert("중복된 이메일입니다.");
        return;
      }

      const { user, error } = await supabase.auth.signUp({
        email: this.user.email,
        password: this.user.password,
      });

      if (error) {
        console.error(error);
        alert("회원가입 중 오류가 발생했습니다.");
      } else {
        const { error: insertError } = await supabase.from("users").insert([
          {
            email: this.user.email,
            password: this.user.password,
            name: this.user.name,
            date: Date(Date.now()),
            phone: this.user.phone,
          },
        ]);

        if (insertError) {
          console.error(insertError);
          alert("사용자 정보를 저장하는 중 오류가 발생했습니다.");
        } else {
          alert("회원가입 되었습니다.");
          this.$router.push("/login");
        }
      }
    },
  },
};
</script>

<style scoped></style>
