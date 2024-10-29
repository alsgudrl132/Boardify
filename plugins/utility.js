// 정규식
function checkRegex(password) {
  const regex =
    /^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}|(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*[a-z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])|(?=.*\d)(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])).{10,})$/;
  const isRegexMatched = regex.test(password);
  return isRegexMatched;
}

function checkRegexMessage(password) {
  const isRegexMatched = checkRegex(password);
  const regexMessage = isRegexMatched ? "사용 가능" : "사용 불가";
  return regexMessage;
}

function checkPassword(password, passwordCheck) {
  const isPasswordMatched = password === passwordCheck ? true : false;
  return isPasswordMatched;
}

function checkPasswordMessage(password) {
  const isPasswordMatched = checkPassword(password);
  const passwordMessage = isPasswordMatched ? "사용 가능" : "사용 불가";
  return passwordMessage;
}

function checkPhoneRegex(phone) {
  const regex = /^01([0|1|6|7|8|9])-([0-9]{3,4})-([0-9]{4})$/;
  const isPhoneRegexMatched = regex.test(phone);
  return isPhoneRegexMatched;
}

function checkPhoneRegexMessage(phone) {
  const isPhoneRegexMatched = checkPhoneRegex(phone);
  const phoneMessage = isPhoneRegexMatched ? "사용 가능" : "사용 불가";
  return phoneMessage;
}

const utils = {
  checkRegex,
  checkRegexMessage,
  checkPassword,
  checkPasswordMessage,
  checkPhoneRegex,
  checkPhoneRegexMessage,
};

export default utils;
