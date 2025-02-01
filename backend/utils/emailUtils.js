const WEBSITE_URL = "https://final-project-frontend-eight.vercel.app/"; // projectHUB link 

//automaticlly add this to any email massage
const appendDoNotReply = (message) => {
    return `${message || ""}\n\nVisit our website: ${WEBSITE_URL}\n\n@doNotReply`;
};

module.exports = { appendDoNotReply };
