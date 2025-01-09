const { addDocument, getDocument, addSubcollection, getSubcollection } = require("../utils/firebaseHelper");

const addUser = async (req, res) => {
  const { id, fullName, email, role, password, supervisorTopics } = req.body;

  // Add user to the main collection
  const response = await addDocument("users", id, { id, fullName, email, role, password });
  if (!response.success) return res.json(response);

  // Add subcollection data
  if (role === "Supervisor" || role === "Admin") {
    await addSubcollection("users", id, "supervisorDetails", { supervisorTopics });
  }
  if (role === "Admin") {
    await addSubcollection("users", id, "adminDetails", { permissions: ["manageUsers", "assignRoles"] });
  }

  res.json({ success: true });
};

const getUser = async (req, res) => {
  const userResponse = await getDocument("users", req.params.id);
  if (!userResponse.success) return res.json(userResponse);

  const supervisorDetails = await getSubcollection("users", req.params.id, "supervisorDetails");
  const adminDetails = await getSubcollection("users", req.params.id, "adminDetails");

  res.json({
    success: true,
    data: {
      ...userResponse.data,
      supervisorDetails: supervisorDetails.success ? supervisorDetails.data : null,
      adminDetails: adminDetails.success ? adminDetails.data : null,
    },
  });
};

module.exports = { addUser, getUser };
