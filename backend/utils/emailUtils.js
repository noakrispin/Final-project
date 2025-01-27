// utils/emailUtils.js
const appendDoNotReply = (message) => {
    return `${message || ""} @doNotReply`;
  };
  
  module.exports = { appendDoNotReply };
  