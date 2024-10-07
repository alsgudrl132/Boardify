<template>
  <b-modal
    id="add-list-modal"
    title="새 리스트 추가"
    @ok="addCard"
    ok-title="추가"
    cancel-title="취소"
    class="trello-modal"
  >
    <b-form-group label="리스트 제목">
      <b-form-input
        v-model="addListData.title"
        placeholder="리스트 제목을 입력해주세요"
        trim
      ></b-form-input>
    </b-form-group>

    <b-form-group label="리스트 내용">
      <b-form-textarea
        v-model="addListData.content"
        placeholder="리스트 내용을 입력해주세요"
        rows="3"
      ></b-form-textarea>
    </b-form-group>

    <b-form-group label="리스트 태그">
      <b-form-tags
        v-model="addListData.tag"
        separator=","
        placeholder="태그를 입력하고 쉼표로 구분하세요"
        class="mb-2"
      ></b-form-tags>
      <small class="text-muted">예: 기획, 설계, 디자인</small>
    </b-form-group>
  </b-modal>
</template>

<script>
export default {
  props: {
    listId: Number,
  },
  data() {
    return {
      addListData: {
        title: "",
        content: "",
        tag: [],
        listId: null,
      },
    };
  },
  methods: {
    async addCard() {
      if (this.addListData.title.trim()) {
        this.addListData.listId = this.listId;
        await this.$store.dispatch("addList", this.addListData);
        await this.$emit("addList");
        this.resetForm();
      }
    },
    resetForm() {
      this.addListData = {
        title: "",
        content: "",
        tag: [],
        listId: null,
      };
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
