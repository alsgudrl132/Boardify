<template>
  <b-modal id="team-modal" title="팀 목록" hide-footer>
    <b-list-group>
      <b-button variant="outline-primary" class="mb-3" @click="noTeam"
        >팀 없음</b-button
      >
      <b-list-group-item
        v-for="team in displayedTeams"
        :key="team.id"
        button
        @click="selectTeam(team.team)"
      >
        {{ team.team }}
      </b-list-group-item>
    </b-list-group>
    <div class="mt-3 d-flex justify-content-center">
      <b-pagination-nav
        :link-gen="linkGen"
        :number-of-pages="totalPages"
        use-router
        align="center"
      ></b-pagination-nav>
    </div>
  </b-modal>
</template>

<script>
import { supabase } from "~/plugins/supabase.js";

export default {
  name: "TeamModal",
  data() {
    return {
      teams: [],
      currentPage: 1,
      perPage: 5,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.teams.length / this.perPage);
    },
    displayedTeams() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.teams.slice(start, end);
    },
  },
  methods: {
    linkGen(pageNum) {
      return pageNum === 1 ? "?" : `?page=${pageNum}`;
    },
    async getTeams() {
      try {
        const { data: teams, error } = await supabase
          .from("teams")
          .select("team");
        if (error) throw error;
        const newTeams = [
          ...new Set(teams.map((item) => JSON.stringify(item))),
        ].map((item) => JSON.parse(item));
        this.teams = newTeams;
      } catch (error) {
        console.error(error);
      }
    },
    selectTeam(team) {
      this.$emit("selectTeam", team);
      this.$bvModal.hide("team-modal");
    },
    noTeam() {
      this.$emit("noTeam");
      this.$bvModal.hide("team-modal");
    },
  },
  watch: {
    "$route.query.page"(newPage) {
      this.currentPage = parseInt(newPage) || 1;
    },
  },
  mounted() {
    this.getTeams();
    this.currentPage = parseInt(this.$route.query.page) || 1;
  },
};
</script>

<style scoped>
.modal-body {
  max-height: 300px;
  overflow-y: auto;
}
</style>
