<template>
  <div class="trello-board">
    <b-container fluid>
      <b-row class="mb-3">
        <b-col>
          <b-button
            variant="primary"
            style="padding-right: 20px"
            v-b-modal.add-card-modal
          >
            <i class="fas fa-plus mr-2"></i>카드 추가
          </b-button>
        </b-col>
      </b-row>
      <div class="board-container">
        <draggable
          v-model="cardData"
          class="card-group"
          group="card-group"
          animation="300"
          @end="updateCards"
          @click="updateCards"
        >
          <b-card
            v-for="card in cardData"
            :key="card.id"
            :header="card.cardTitle"
            class="board-column mb-3 mr-3"
          >
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ card.cardTitle }}</h5>
                <b-button
                  variant="outline-danger"
                  size="sm"
                  @click="deleteCard(card.id)"
                >
                  <i class="fas fa-trash"></i>
                </b-button>
              </div>
            </template>

            <b-button
              variant="outline-primary"
              block
              @click="addList(card.id)"
              class="mb-3"
              v-b-modal.add-list-modal
            >
              <i class="fas fa-plus mr-2"></i>리스트 추가
            </b-button>

            <draggable
              v-model="card.cardgroups"
              group="card-item-group"
              class="list-group"
              animation="300"
              @end="updateLists(card)"
            >
              <b-list-group-item
                v-for="(group, groupIndex) in card.cardgroups"
                :key="groupIndex"
                @click="openPopup(group)"
                class="mb-2 task-item"
              >
                <div class="mb-2">
                  <b-badge
                    v-for="(groupTag, groupTagIndex) in group.grouptag"
                    :key="groupTagIndex"
                    variant="info"
                    class="mr-1"
                    style="background-color: cornflowerblue"
                  >
                    {{ groupTag }}
                  </b-badge>
                </div>
                <strong>리스트 번호 : {{ group.id }}</strong>
                <hr />
                <h5>{{ group.grouptitle }}</h5>
              </b-list-group-item>
            </draggable>
          </b-card>
        </draggable>
      </div>
    </b-container>

    <Popup
      :showModal="showModal"
      :cardId="cardId"
      :modalId="modalId"
      @modalState="modalState"
      @updateData="getModalData"
      @addComment="openPopup(groupData)"
      @deleteComment="openPopup(groupData)"
      @updateGroup="updateGroup"
    />
    <AddCardPopup @addCard="getCard" />
    <AddListPopup @addList="getCard" :listId="listId" />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import Popup from "../components/Popup.vue";
import AddCardPopup from "../components/AddCardPopup.vue";
import AddListPopup from "../components/AddListPopup.vue";
import jwt from "jsonwebtoken";

export default {
  components: {
    draggable,
    Popup,
    AddCardPopup,
    AddListPopup,
  },
  data() {
    return {
      cardData: [],
      showModal: false,
      listId: null,
      cardId: null,
      modalId: "modal-1",
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
      await this.getCard();
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
    async getCard() {
      try {
        await this.$store.dispatch("getCardData");
        const data = JSON.parse(
          JSON.stringify(this.$store.state.cardData.cards)
        );
        this.cardData = data.sort((a, b) => a.position - b.position);
      } catch (error) {
        console.error("Error fetching card data:", error);
        this.$bvToast.toast("카드 데이터를 불러오는데 실패했습니다.", {
          title: "오류",
          variant: "danger",
          solid: true,
        });
      }
    },
    addList(data) {
      this.listId = data;
    },
    deleteCard(data) {
      this.$bvModal
        .msgBoxConfirm("정말 삭제하시겠습니까?", {
          title: "카드 삭제",
          okVariant: "danger",
          okTitle: "삭제",
          cancelTitle: "취소",
        })
        .then((value) => {
          if (value) {
            this.$store.dispatch("deleteCard", data);
            this.getCard();
          }
        });
    },
    openPopup(group) {
      this.cardId = group.id;
      this.showModal = true;
    },
    modalState(state) {
      this.showModal = state;
    },
    getModalData(data) {
      console.log(data);
    },
    updateCards() {
      this.cardData.forEach((card, index) => {
        card.position = index;
      });
      this.$store.dispatch("updateCards", this.cardData);
    },
    updateLists() {
      this.cardData.forEach((card) => {
        card.cardgroups.forEach((group) => {
          group.cardId = card.id;
        });
      });
      this.$store.dispatch("updateLists", this.cardData);
    },
    async updateGroup() {
      await this.getCard();
    },
  },
};
</script>

<style scoped>
.trello-board {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.board-container {
  display: flex;
  overflow-x: auto;
  padding-bottom: 20px;
}

.card-group {
  display: flex;
  gap: 20px;
}

.board-column {
  min-width: 300px;
  max-width: 300px;
  background-color: aliceblue;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
}

.task-item {
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background-color: #f4f5f7;
}

/* Responsive styles */
@media (max-width: 768px) {
  .board-column {
    min-width: 250px;
  }
}
</style>
