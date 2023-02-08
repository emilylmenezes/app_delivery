const { getUsers, deleteUser } = require('../services/userService');

const getUsersHandler = async (req, res) => {
  const role = req.query;
  const result = await getUsers(role);

  const { status, message } = result;
  return res.status(status).json(message);
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;
  const result = await deleteUser(id);

  const { status } = result;
  return res.status(status).json({ message: 'user deleted' });
};

module.exports = { getUsersHandler, deleteUserById };
