<template>
  <b-modal id="team-modal" title="팀 목록" hide-footer>
    <b-list-group>
      <b-input
        type="text"
        @input="searchKeyword"
        v-model="keyword"
        placeholder="검색할 팀 이름을 입력해주세요."
        class="mb-3"
      />
      <b-button variant="outline-primary" class="mb-3" @click="noTeam">
        팀 없음
      </b-button>
      <div v-if="filterData.length > 0">
        <b-list-group-item
          v-for="team in displayedTeams"
          :key="team.id"
          button
          @click="selectTeam(team.team)"
        >
          <li style="list-style-type: none">
            {{ team.team }}
          </li>
        </b-list-group-item>
      </div>
      <div v-else>
        <b-list-group-item> 데이터가 존재하지 않습니다 </b-list-group-item>
      </div>
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
      keyword: "",
      filterData: [],
    };
  },
  computed: {
    totalPages() {
      if (this.filterData.length < 1) {
        return 1;
      } else {
        return Math.ceil(this.filterData.length / this.perPage);
      }
    },
    displayedTeams() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filterData.slice(start, end);
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
        this.filterData = newTeams;
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
    searchKeyword() {
      this.filterData = this.teams?.filter((item) =>
        item.team?.includes(this.keyword)
      );
      this.currentPage = 1;
    },
  },
  watch: {
    "$route.query.page"(newPage) {
      this.currentPage = parseInt(newPage) || 1;
    },
  },
  mounted() {
    this.getTeams();
    this.currentPage = 1;
  },
};
</script>

<style scoped>
.modal-body {
  max-height: 300px;
  overflow-y: auto;
}
</style>
