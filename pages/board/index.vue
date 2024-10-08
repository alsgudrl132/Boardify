<template>
  <div class="board-page">
    <b-container fluid>
      <b-row class="mb-3">
        <b-col>
          <h2 class="board-title">게시판</h2>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col>
          <b-button
            v-if="this.$store.state.isLogIn"
            variant="primary"
            @click="regist"
            style="padding-right: 20px"
          >
            <i class="fas fa-plus mr-2"></i>글 작성
          </b-button>
          <b-form-checkbox
            v-if="this.$store.state.isLogIn"
            v-model="checked"
            name="check-button"
            @change="getIsChecked"
            switch
            class="mt-3"
          >
            내 글 보기
          </b-form-checkbox>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-table
            :items="sortedBoardData"
            :per-page="perPage"
            :current-page="currentPage"
            striped
            hover
            responsive
            class="board-table"
          >
            <template #cell(title)="data">
              <NuxtLink :to="'/board/' + data.item.id" class="board-link">
                {{ data.item.title }}
              </NuxtLink>
            </template>
            <template #cell(content)="data">
              <NuxtLink :to="'/board/' + data.item.id" class="board-link">
                <span class="ellipsis">{{ data.item.content }}</span>
              </NuxtLink>
            </template>
            <template #cell(date)="data">
              {{ data.item.date }}
            </template>
          </b-table>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="d-flex justify-content-center">
          <b-pagination
            v-model="currentPage"
            :total-rows="rows"
            :per-page="perPage"
            aria-controls="board-table"
          ></b-pagination>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
import jwt from "jsonwebtoken";

export default {
  computed: {
    rows() {
      return this.sortedBoardData.length;
    },
    sortedBoardData() {
      const boardData = Array.isArray(this.$store.state.boardData)
        ? this.$store.state.boardData
        : [];

      return [...boardData].sort((a, b) => {
        const parseKoreanDate = (dateString) => {
          const regex =
            /(\d{4})년(\d{1,2})월(\d{1,2})일\s(\d{1,2})시(\d{1,2})분(\d{1,2})초/;
          const match = dateString.match(regex);

          if (match) {
            const [, year, month, day, hour, minute, second] =
              match.map(Number);
            return new Date(year, month - 1, day, hour, minute, second);
          }

          console.error("Invalid date format:", dateString);
          return new Date(0);
        };

        const dateA = parseKoreanDate(a.date);
        const dateB = parseKoreanDate(b.date);

        return dateB - dateA;
      });
    },
  },
  data() {
    return {
      checked: false,
      perPage: 10,
      currentPage: 1,
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
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        alert("토큰이 만료되었습니다 다시 로그인해주세요.");
        this.$store.dispatch("logOut");
        this.$router.push("/login");
      } else {
        console.log(e);
      }
    }

    this.$store.dispatch("getBoardData", this.checked);
  },
  methods: {
    regist() {
      this.$router.push("/board/regist");
    },
    getIsChecked() {
      this.$store.dispatch("getBoardData", this.checked);
    },
  },
};
</script>

<style>
.board-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.board-title {
  color: #172b4d;
  font-weight: 600;
}

.board-link {
  color: #172b4d;
  text-decoration: none;
}

.board-link:hover {
  text-decoration: underline;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: inline-block;
}

/* 테이블 스타일 */
.board-table {
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
}

.board-table th {
  background-color: #f4f5f7;
  border-bottom: 2px solid #dfe1e6;
  color: #5e6c84;
  font-weight: 600;
}

.board-table td {
  border-bottom: 1px solid #dfe1e6;
}

/* 페이지네이션 스타일 */
.pagination {
  margin-top: 1rem;
}

.page-item.active .page-link {
  background-color: #0079bf;
  border-color: #0079bf;
}
</style>
