<template>
  <b-modal
    id="add-card-modal"
    title="새 카드 추가"
    @ok="addCard"
    ok-title="추가"
    cancel-title="취소"
    class="trello-modal"
  >
    <b-form-group label="카드 제목">
      <b-form-input
        v-model="addCardData.title"
        placeholder="카드 제목을 입력해주세요"
        trim
      ></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      addCardData: {
        title: "",
      },
    };
  },
  methods: {
    async addCard() {
      if (this.addCardData.title.trim()) {
        await this.$store.dispatch("addCard", this.addCardData);
        await this.$emit("addCard");
        this.addCardData.title = "";
      }
    },
  },
};
</script>

<style scoped>
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
