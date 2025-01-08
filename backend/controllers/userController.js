const { addDocument, getDocument } = require("../utils/firebaseHelper");

const addUser = async (req, res) => {
  const { id, fullName, email, role, password } = req.body;
  const response = await addDocument("users", id, { id, fullName, email, role, password });
  res.json(response);
};

const getUser = async (req, res) => {
  const response = await getDocument("users", req.params.id);
  res.json(response);
};

module.exports = { addUser, getUser };
