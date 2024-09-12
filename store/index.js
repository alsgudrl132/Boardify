// store/index.js

import axios from "axios";

export const state = () => ({
  cardData: [
    {
      id: null, // 카드의 고유 ID
      team: "", // 카드의 고유 팀
      makeCardUserEmail: "", // 카드 작성자 이메일
      cardTitle: "", // 카드 제목
      cardContent: "", // 카드 내용
      cardTag: [], // 카드 태그
      cardDate: "", // 카드 작성일
      files: [
        // 카드에 첨부된 파일들
        {
          id: null, // 파일의 고유 ID
          name: "", // 파일 이름
          url: "", // 파일의 URL
          type: "", // 파일의 MIME 타입 (예: image/jpeg, application/pdf 등)
        },
      ],
      cardModal: {
        // 모달 관련 데이터
        modalTitle: "", // 모달 제목
        modalContent: "", // 모달 내용
        comments: [
          // 댓글 목록
          {
            id: null, // 댓글의 고유 ID
            commentText: "", // 댓글 내용
            commenterEmail: "", // 댓글 작성자 이메일
            commentDate: "", // 댓글 작성일
          },
        ],
      },
    },
  ],
  userInfo: {
    email: "",
  },
  boardData: [
    {
      id: null, // 보드 아이디
      title: "", // 보드 타이틀
      content: "", // 보드 콘첸츠
      email: "", // 보드를 작성한 사람의 이메일
    },
  ],
  isLogIn: false, // 로그인 여부
  emailCheck: false, // 이메일 확인용
  isAuth: false, // 글쓴이 확인용
  userId: null,
});

export const mutations = {
  logOut(state) {
    state.isLogIn = false;
    state.userInfo.email = "";
  },
  logIn(state) {
    state.isLogIn = true;
  },
  getCardData(state, payload) {
    state.cardData = payload;
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
  getBoardData(state, payload) {
    state.boardData = payload;
  },
  getBoardDataById(state, payload) {
    state.boardData = payload;
  },
  emailCheck(state, payload) {
    const localEmail = localStorage.getItem("email");
    state.emailCheck = localEmail === payload;
  },
};

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
        console.error("User email not found in local storage");
        return;
      }
      const userRes = await axios.get("http://localhost:3003/users");
      const users = userRes.data;
      const user = users.find((user) => user.email === userEmail);
      if (!user) {
        console.error("User not found");
        return;
      }
      const userTeam = user.team;
      const cardRes = await axios.get("http://localhost:3003/card");
      const cards = cardRes.data;
      const filteredCards = cards.filter((card) => card.team === userTeam);

      console.log("Filtered Cards:", filteredCards);
      commit("getCardData", filteredCards);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  getMemberInfo({ commit }) {
    commit("getMemberInfo");
  },
  async getIsAuth({ commit }, data) {
    const userRes = await axios.get(`http://localhost:3003/users`);
    const user = userRes.data.find(
      (user) => user.email === localStorage.getItem("email")
    );
    const boardRes = await axios.get(`http://localhost:3003/board/${data}`);
    try {
      if (user !== undefined) {
        const result = boardRes.data.email === user.email;
        commit("getIsAuth", result);
      }
    } catch (err) {
      console.log(err);
    }
  },
  async getUserId({ commit }) {
    try {
      const res = await axios.get(`http://localhost:3003/users`);
      const user = res.data.find(
        (user) => user.email === localStorage.getItem("email")
      );
      if (user) {
        commit("getUserId", user.id);
      }
    } catch (err) {
      console.log(err);
    }
  },
  async getBoardData({ commit }, data) {
    try {
      const res = await axios.get(`http://localhost:3003/board`);
      if (data === true) {
        const resultArray = res.data.filter((item) => {
          return item.email === localStorage.getItem("email");
        });
        console.log(resultArray);
        commit("getBoardData", resultArray);
      } else {
        commit("getBoardData", res.data);
      }
    } catch (err) {
      console.log(err);
    }
  },

  async getBoardDataById({ commit }, data) {
    try {
      const res = await axios.get(`http://localhost:3003/board/${data}`);
      commit("getBoardDataById", res.data);
    } catch (err) {
      console.log(err);
    }
  },
  async insertBoard({ commit }, data) {
    try {
      const res = await axios.post(`http://localhost:3003/board`, data);
      if (res.status === 201) {
        alert("정상적으로 등록되었습니다.");
      }
    } catch (err) {
      console.log(err);
    }
  },
};

export const getters = {};
