<template>
  <div class="card-scroll-container">
    <draggable
      v-model="cardData"
      class="card-group"
      group="card-group"
      :options="{ animation: 300 }"
    >
      <b-card
        v-for="card in cardData"
        :key="card.id"
        :header="card.cardTitle"
        class="scroll-card mx-3 mt-2"
      >
        <b-list-group class="card-list-group">
          <draggable
            v-model="card.cardGroup"
            class="card-item-group"
            group="card-item-group"
            :options="{ animation: 300 }"
          >
            <b-list-group-item
              v-for="(group, index) in card.cardGroup"
              :key="index"
              class="card-list-group-item"
              href="#"
            >
              <b-form-tags
                class="tag"
                input-id="tags-remove-on-delete"
                :value="group.cardTag"
                readonly
                disabled
                placeholder=""
                tag-variant="primary"
              ></b-form-tags>
              {{ group.cardContent }}
            </b-list-group-item>
          </draggable>
        </b-list-group>
      </b-card>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
export default {
  components: {
    draggable,
  },
  data() {
    return {
      cardData: [],
    };
  },
  mounted() {
    this.$store
      .dispatch("getCardData")
      .then(() => {
        this.cardData = JSON.parse(JSON.stringify(this.$store.state.cardData));
      })
      .catch((error) => {
        console.error("Error fetching card data:", error);
      });
  },
};
</script>

<style scoped>
.card-scroll-container {
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px;
  -webkit-overflow-scrolling: touch;
}

.card-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 15px; /* 요소 간의 간격을 조정합니다 */
}

.scroll-card {
  flex: 0 0 auto;
  max-width: 15vw;
  width: calc(
    50% - 15px
  ); /* 카드의 너비를 조정하며, 마진을 고려하여 너비를 조정합니다 */
  margin: 0;
  box-sizing: border-box; /* 패딩과 보더를 포함한 전체 너비 설정 */
}

/* Responsive styles */
@media (max-width: 1200px) {
  .scroll-card {
    width: calc(50% - 15px); /* 카드의 너비를 조정합니다 */
  }
}

@media (max-width: 992px) {
  .scroll-card {
    width: calc(100% - 15px); /* 화면 크기에 따라 카드 너비 조정 */
  }
}

@media (max-width: 768px) {
  .card-scroll-container {
    padding: 5px;
  }

  .scroll-card {
    width: calc(100% - 10px); /* 화면 크기에 따라 카드 너비 조정 */
    margin: 5px 0; /* 카드 간의 마진 조정 */
  }
}
</style>
