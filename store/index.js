// store/index.js

import { all } from "core-js/fn/promise";
import { supabase } from "~/plugins/supabase.js";

// 상태 정의
export const state = () => ({
  cardData: [],
  groupData: {},
  commentData: [],
  userInfo: {
    email: "",
  },
  boardData: [],
  isLogIn: false,
  emailCheck: false,
  isAuth: false,
  userId: null,
});

// 뮤테이션 정의
export const mutations = {
  logOut(state) {
    state.isLogIn = false;
    state.userInfo.email = "";
  },
  logIn(state) {
    state.isLogIn = true;
  },
  getBoardData(state, payload) {
    state.boardData = payload;
  },
  getBoardDataById(state, payload) {
    state.boardData = payload;
  },
  getMemberInfo(state) {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("authToken");
    state.isLogIn = token !== null;
    state.userInfo.email = email || "";
  },
  getIsAuth(state, payload) {
    state.isAuth = payload;
  },
  getUserId(state, payload) {
    state.userId = payload;
  },
  emailCheck(state, payload) {
    const localEmail = localStorage.getItem("email");
    state.emailCheck = localEmail === payload;
  },
  getCardData(state, payload) {
    state.cardData = payload;
  },
  getGroup(state, payload) {
    state.groupData = payload;
  },
  getComment(state, payload) {
    state.commentData = payload;
  },
  addComment(state, payload) {
    state.commentData.push(payload);
  },
  deleteComment(state, payload) {
    const index = state.commentData.findIndex((item) => item.id === payload);
    if (index !== -1) {
      state.commentData.splice(index, 1);
    }
  },
};

// 액션 정의
export const actions = {
  logOut({ commit }) {
    localStorage.removeItem("email");
    localStorage.removeItem("authToken");
    commit("logOut");
  },
  logIn({ commit }) {
    commit("logIn");
  },
  emailCheck({ commit }, email) {
    commit("emailCheck", email);
  },
  async getCardData({ commit }) {
    try {
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

      if (userError || !users) {
        console.error("사용자 정보를 가져오는 중 오류 발생:", userError);
        return;
      }

      const userTeam = users.team;

      const { data, error } = await supabase
        .from("cards")
        .select(
          `
        id,
        team,
        makeCardUserId,
        cardTitle,
        position,
        cardgroups (
          id,
          cardid,
          grouptitle,
          groupcontent,
          grouptag,
          groupdate,
          team,
          position,
          cardgroupcomments (
            id,
            commenttext,
            commenteremail,
            commentdate
          )
        )
      `
        )
        .eq("team", userTeam);

      if (error) {
        console.error("카드 데이터를 가져오는 중 오류 발생:", error);
        return;
      }

      const allData = {
        cards: data,
      };

      commit("getCardData", allData);
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
    }
  },
  async addCard({ commit }, card) {
    try {
      const userEmail = localStorage.getItem("email");
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail);
      if (error) {
        throw error;
      } else {
        const newCard = {
          team: data[0].team,
          cardTitle: card.title,
          makeCardUserId: userEmail,
        };
        try {
          const { addCardError } = await supabase
            .from("cards")
            .insert(newCard)
            .eq("id", data[0].id);
          if (addCardError) {
            throw addCardError;
          }
        } catch (addCardError) {
          console.error("카드데이터를 추가하는 중 오류 발생:", addCardError);
        }
      }
    } catch (error) {
      console.error("유저데이터를 가져오는 중 오류 발생:", error);
    }
  },
  async deleteCard({ commit }, id) {
    try {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("카드데이터를 삭제하는 중 오류 발생:", error);
    }
  },
  async updateCards({ commit }, cards) {
    try {
      for (const card of cards) {
        const { error } = await supabase
          .from("cards")
          .update({ position: card.position })
          .eq("id", card.id);

        if (error) {
          console.error(`Error updating card with id ${card.id}:`, error);
        } else {
          console.log(`Card with id ${card.id} updated successfully`);
        }
      }
    } catch (error) {
      console.error("카드 업데이트 중 오류 발생:", error);
    }
  },
  async updateLists({ state }, lists) {
    for (const item of lists) {
      const { error: cardError } = await supabase
        .from("cards")
        .update({
          cardTitle: item.cardTitle,
          position: item.position,
        })
        .eq("id", item.id);

      if (cardError) {
        console.error("카드 업데이트 중 오류 발생:", cardError);
      } else {
        console.log(`ID가 ${item.id}인 카드가 성공적으로 업데이트되었습니다.`);
      }

      // Update the card groups
      for (const cardGroup of item.cardgroups) {
        const { error: groupError } = await supabase
          .from("cardgroups")
          .update({
            cardid: item.id,
            grouptitle: cardGroup.grouptitle,
            groupcontent: cardGroup.groupcontent,
            grouptag: cardGroup.grouptag,
            groupdate: cardGroup.groupdate,
            team: cardGroup.team,
            position: cardGroup.position,
          })
          .eq("id", cardGroup.id);

        if (groupError) {
          console.error("카드 그룹 업데이트 중 오류 발생:", groupError);
        } else {
          console.log(
            `ID가 ${cardGroup.id}인 카드 그룹이 성공적으로 업데이트되었습니다.`
          );
        }
      }
    }
  },

  async addList({ commit }, list) {
    try {
      const userEmail = localStorage.getItem("email");
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail);
      if (error) throw error;

      try {
        const newList = {
          grouptitle: list.title,
          groupcontent: list.content,
          grouptag: list.tag,
          groupdate: new Date(Date.now()),
          cardid: list.listId,
          team: data[0].team,
        };
        const { listError } = await supabase
          .from("cardgroups")
          .insert(newList)
          .eq("cardid", list.listId);
        if (listError) throw listError;
      } catch (listError) {
        console.error("리스트데이터를 추가하는 중 오류 발생:", listError);
      }
    } catch (error) {
      console.error("유저데이터를 가져오는 중 오류 발생:", error);
    }
  },
  async getGroup({ commit }, id) {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("cardgroups")
        .select("*")
        .eq("id", id);
      groupData.forEach((list, index) => {
        groupData.map((item, index) => {
          const date = new Date(item.groupdate);
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let hour = date.getHours();
          let min = date.getMinutes();
          let sec = date.getSeconds();
          item.groupdate = `${year}년${month}월${day}일 ${hour}시${min}분${sec}초`;
        });
      });
      commit("getGroup", groupData);

      if (groupError) throw groupError;
    } catch (groupError) {
      console.error(groupError);
    }
  },
  async updateGroup({ commit }, params) {
    try {
      const { error: groupError } = await supabase
        .from("cardgroups")
        .update({
          grouptitle: params.grouptitle,
          groupcontent: params.groupcontent,
          grouptag: params.grouptag,
          team: params.team,
        })
        .eq("id", params.id);

      if (groupError) throw groupError;
    } catch (groupError) {
      console.error(groupError);
    }
  },
  async addTag({ commit }, params) {
    try {
      const { data: existingGroup, error: fetchError } = await supabase
        .from("cardgroups")
        .select("grouptag")
        .eq("id", params.id)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = existingGroup.grouptag || [];

      if (!currentTags.includes(params.tag)) {
        currentTags.push(params.tag);
      }

      const { error } = await supabase
        .from("cardgroups")
        .update({ grouptag: currentTags })
        .eq("id", params.id);

      if (error) throw error;
    } catch (error) {
      console.log(error);
    }
  },
  async deleteTag({ commit }, params) {
    try {
      const { data: existingGroup, error: fetchError } = await supabase
        .from("cardgroups")
        .select("grouptag")
        .eq("id", params.id)
        .single();

      if (fetchError) throw fetchError;

      const currentTags = existingGroup.grouptag || [];

      const updatedTags = currentTags.filter((tag) => tag !== params.tag);

      const { error } = await supabase
        .from("cardgroups")
        .update({ grouptag: updatedTags })
        .eq("id", params.id);

      if (error) throw error;
    } catch (error) {
      console.log(error);
    }
  },
  async getComment({ commit }, id) {
    try {
      const { data: comments, error: commentError } = await supabase
        .from("cardgroupcomments")
        .select("*")
        .eq("cardgroupid", id);
      comments.map((item, index) => {
        console.log(item);
        const date = new Date(item.commentdate);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hour = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        item.commentdate = `${year}년${month}월${day}일 ${hour}시${min}분${sec}초`;
      });

      commit("getComment", comments);

      if (commentError) throw commentError;
    } catch (commentError) {
      console.error(commentError);
    }
  },
  async addComment({ commit }, params) {
    const userEmail = localStorage.getItem("email");
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("team")
      .eq("email", userEmail)
      .single();

    if (userError || !users) {
      console.error("사용자 정보를 가져오는 중 오류 발생:", userError);
      return;
    }

    const userTeam = users.team;
    const data = {
      cardgroupid: params.id,
      commenttext: params.comment,
      commenteremail: userEmail,
      commentdate: new Date(Date.now()),
      team: userTeam,
    };

    try {
      const { error } = await supabase.from("cardgroupcomments").insert(data);
      if (error) throw error;

      commit("addComment", data);
    } catch (error) {
      console.error("코멘트를 추가하는 중 오류 발생:", error);
    }
  },
  async deleteComment({ commit }, params) {
    try {
      const { error } = await supabase
        .from("cardgroupcomments")
        .delete()
        .eq("id", params.id);
      if (error) throw error;

      commit("deleteComment", params.id);
    } catch (error) {
      console.error("코멘트 삭제중 오류 발생:", error);
    }
  },
  async deleteList({ commit }, params) {
    try {
      const { error } = await supabase
        .from("cardgroups")
        .delete()
        .eq("id", params);
      if (error) throw error;
    } catch (error) {
      console.error("리스트 삭제중 오류 발생:", error);
    }
  },
  async updateComment({ commit }, params) {
    try {
      const { error } = await supabase
        .from("cardgroupcomments")
        .update({
          commenttext: params.commenttext,
          commentdate: new Date(Date.now()),
        })
        .eq("id", params.id);

      if (error) throw error;
    } catch (error) {
      console.error("코멘트 업데이트중 오류 발생:", error);
    }
  },
  async getMemberInfo({ commit }) {
    commit("getMemberInfo");
  },
  async getIsAuth({ commit }, data) {
    try {
      const userEmail = localStorage.getItem("email");
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail);

      if (userError) throw userError;

      const user = users[0];
      if (!user) {
        console.error("User not found");
        commit("getIsAuth", false);
      }

      const { data: board, error: boardError } = await supabase
        .from("boards")
        .select("*")
        .eq("id", data);

      if (boardError) throw boardError;

      const result = board[0].email === user.email;
      commit("getIsAuth", result);
    } catch (error) {
      console.error("Error checking authorization:", error);
    }
  },

  async getUserId({ commit }) {
    try {
      const userEmail = localStorage.getItem("email");
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail);

      if (error) throw error;

      const user = users[0];
      if (user) {
        commit("getUserId", user.id);
      }
    } catch (err) {
      console.error("Error fetching user ID:", err);
    }
  },
  async getBoardData({ commit }, data) {
    try {
      const { data: boards, error } = await supabase.from("boards").select("*");

      if (error) throw error;

      if (data === true) {
        const resultArray = boards.filter(
          (item) => item.email === localStorage.getItem("email")
        );
        resultArray.map((item, index) => {
          const date = new Date(item.date);
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let hour = date.getHours();
          let min = date.getMinutes();
          let sec = date.getSeconds();
          item.date = `${year}년${month}월${day}일 ${hour}시${min}분${sec}초`;
        });
        commit("getBoardData", resultArray);
      } else {
        boards.map((item, index) => {
          const date = new Date(item.date);
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let hour = date.getHours();
          let min = date.getMinutes();
          let sec = date.getSeconds();
          item.date = `${year}년${month}월${day}일 ${hour}시${min}분${sec}초`;
        });
        commit("getBoardData", boards);
      }
    } catch (err) {
      console.error("Error fetching board data:", err);
    }
  },
  async getBoardDataById({ commit }, id) {
    try {
      const { data: board, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", id);

      if (error) throw error;

      const date = new Date(board[0].date);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let hour = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();
      board[0].date = `${year}년${month}월${day}일 ${hour}시${min}분${sec}초`;

      commit("getBoardDataById", board[0]);
    } catch (err) {
      console.error("Error fetching board data by ID:", err);
    }
  },
  async addBoard({ commit }, data) {
    try {
      const { error } = await supabase.from("boards").insert(data);
      if (error) throw error;
      alert("정상적으로 등록되었습니다.");
    } catch (err) {
      console.error("Error inserting board data:", err);
    }
  },
};

// 게터 정의
export const getters = {};
