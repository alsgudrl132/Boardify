<template>
  <b-modal
    :id="modalId"
    :title="groupData.grouptitle"
    @hide="onHide"
    @show="onShow"
    v-model="modalState"
    @ok="updateGroup"
    size="lg"
    class="trello-modal"
  >
    <div class="modal-header-actions mb-3 d-flex justify-content-between">
      <strong class="mt-1">카드번호 : {{ groupData.cardid }}</strong>
      <div>
        <b-button
          variant="outline-danger"
          size="sm"
          @click="deleteGroup"
          class="pr-12px"
        >
          <i class="fas fa-trash mr-1"></i>리스트 삭제
        </b-button>
      </div>
    </div>
    <b-form-input
      v-model="groupData.grouptitle"
      class="mb-3"
      placeholder="리스트 제목"
    />
    <p class="text-muted">{{ groupData.groupdate }}</p>
    <div class="tag-input-group mb-3">
      <b-input-group>
        <b-form-input placeholder="추가할 태그를 입력해주세요." v-model="tag" />
        <b-input-group-append>
          <b-button
            variant="outline-primary"
            @click="addOrDeleteTag('add')"
            class="pr-12px"
          >
            <i class="fas fa-plus mr-1"></i>등록
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
    <div class="tag-list mb-3">
      <b-badge
        v-for="groupTag in groupData.grouptag"
        :key="groupTag"
        variant="info"
        class="mr-1 mb-1"
        style="background-color: cornflowerblue"
      >
        {{ groupTag }}
        <b-button
          size="sm"
          variant="link"
          class="p-0 ml-1"
          style="
            background-color: red;
            width: 7px;
            height: 7px;
            margin-bottom: 0.094rem;
          "
          @click="addOrDeleteTag('delete', groupTag)"
        >
        </b-button>
      </b-badge>
    </div>
    <b-form-group label="설명">
      <b-form-textarea
        v-model="groupData.groupcontent"
        rows="5"
        max-rows="8"
        class="mb-3"
        placeholder="추가할 설명을 입력해주세요."
      ></b-form-textarea>
    </b-form-group>
    <hr />
    <h6>코멘트</h6>
    <b-form-textarea
      v-model="commentData.commenttext"
      rows="3"
      class="mb-2"
      placeholder="추가할 코멘트를 입력해주세요."
    />
    <b-button
      variant="primary"
      size="sm"
      @click="addComment"
      class="mb-3 pr-12px"
    >
      <i class="fas fa-comment mr-1"></i>등록
    </b-button>
    <div class="comment-list">
      <div
        v-for="(item, index) in commentData"
        :key="index"
        class="comment-item mb-3"
      >
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center">
            <b-avatar
              variant="info"
              :text="item.commenteremail.charAt(0).toUpperCase()"
              style="background-color: cornflowerblue"
            ></b-avatar>
            <span class="ml-2 font-weight-bold">{{ item.commenteremail }}</span>
          </div>
          <small class="text-muted">{{ item.commentdate }}</small>
        </div>
        <b-form-textarea
          v-if="userId === item.commenteremail"
          v-model="item.commenttext"
          rows="2"
          max-rows="4"
          class="mb-2"
        ></b-form-textarea>
        <p v-else class="mb-2">{{ item.commenttext }}</p>
        <div v-if="item.commenteremail === userId" class="text-right">
          <b-button
            size="sm"
            variant="outline-primary"
            class="mr-1 pr-12px"
            @click="updateOrDeleteComment('update', item, index)"
          >
            <i class="fas fa-edit mr-1"></i>수정
          </b-button>
          <b-button
            size="sm"
            variant="outline-danger"
            @click="updateOrDeleteComment('delete', item)"
            class="pr-12px"
          >
            <i class="fas fa-trash mr-1"></i>삭제
          </b-button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { supabase } from "~/plugins/supabase.js";

export default {
  data() {
    return {
      comment: "",
      isAuth: false,
      tag: "",
    };
  },
  props: {
    cardId: Number,
    showModal: Boolean,
    modalId: String,
  },
  computed: {
    modalState: {
      get() {
        return JSON.parse(JSON.stringify(this.showModal));
      },
      set(value) {},
    },
    userId() {
      return localStorage.getItem("email");
    },
    groupData: {
      get() {
        return { ...this.$store.state.groupData[0] };
      },
      set() {},
    },
    commentData: {
      get() {
        return JSON.parse(JSON.stringify(this.$store.state.commentData));
      },
      set() {},
    },
  },
  methods: {
    async onShow() {
      this.$emit("modalState", true);

      await this.$store.dispatch("getGroup", this.cardId);

      await this.$store.dispatch("getComment", this.cardId);
    },
    onHide() {
      this.$emit("modalState", false);
    },
    addOrDeleteTag(type, item) {
      const thisTag = type === "delete" ? item : this.tag; // 태그 결정

      const data = {
        id: this.cardId,
        tag: thisTag,
      };
      if (type === "delete") {
        if (confirm("정말 삭제하시겠습니까?")) {
          this.$store
            .dispatch(`${type}Tag`, data) // 'addTag' 또는 'deleteTag'로 처리
            .then(() => {
              return this.$store.dispatch("getGroup", this.cardId);
            })
            .then(() => {
              this.groupData = this.$store.state.groupData;
            });
        } else return;
      } else if (type === "add") {
        this.$store
          .dispatch(`${type}Tag`, data) // 'addTag' 또는 'deleteTag'로 처리
          .then(() => {
            return this.$store.dispatch("getGroup", this.cardId);
          })
          .then(() => {
            this.groupData = this.$store.state.groupData;
          });

        this.$parent.getCard();
      }
    },

    addComment() {
      const data = {
        id: this.cardId,
        comment: this.commentData.commenttext,
      };

      this.$store
        .dispatch("addComment", data)
        .then(() => {
          // 댓글 추가 후 댓글 목록을 다시 가져오기
          return this.$store.dispatch("getComment", this.cardId);
        })
        .then(() => {
          // 추가된 댓글 데이터 반영
          this.commentData = this.$store.state.commentData;
        })
        .catch((error) => {
          console.error("댓글 추가 중 오류 발생:", error);
        });
    },
    updateOrDeleteComment(type, item, index) {
      const thisType = type === "update" ? "수정" : "삭제";
      if (confirm(`정말 ${thisType}하시겠습니까?`)) {
        this.$store.dispatch(`${type}Comment`, item, index);
      } else {
        return;
      }
    },
    async updateGroup() {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        console.error("로컬 스토리지에서 사용자 이메일을 찾을 수 없습니다.");
        return;
      }

      const { data: users, error: userError } = await supabase
        .from("users")
        .select("team")
        .eq("email", userEmail)
        .single();
      const data = {
        id: this.cardId,
        grouptitle: this.groupData.grouptitle,
        groupcontent: this.groupData.groupcontent,
        grouptag: this.groupData.grouptag,
        groupdate: new Date(Date.now()),
        team: users.team,
      };
      this.$store.dispatch("updateGroup", data).then(() => {
        this.$emit("updateGroup", this.cardId);
      });
    },
    async deleteGroup() {
      console.log(this.cardId);
    },
  },
};
</script>

<style scoped>
.trello-modal {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans,
    Ubuntu, Droid Sans, Helvetica Neue, sans-serif;
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

.trello-modal >>> .modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #172b4d;
}

.trello-modal >>> .modal-body {
  background-color: #f4f5f7;
  padding: 20px;
}

.tag-input-group {
  display: flex;
  align-items: center;
}

.tag-input-group .input-group {
  flex-grow: 1;
}

.tag-input-group .btn {
  white-space: nowrap;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
}

.comment-item {
  background-color: #fff;
  border-radius: 3px;
  padding: 12px;
  box-shadow: 0 1px 2px -1px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
}

.comment-item:hover {
  background-color: #f4f5f7;
}

.modal-header-actions {
  display: flex;
  justify-content: flex-end;
}

.pr-12px {
  padding-right: 12px;
}
</style>
