const { User } = require('../../database/models');
    
const getUsers = async (role = {}) => {
    const result = await User
      .findAll({ where: role, attributes: { exclude: ['password'] } });
    return { status: 200, message: result };
};

const deleteUser = async (id) => {
  await User.destroy({ where: { id } });
  return { status: 202 };
};

module.exports = { getUsers, deleteUser };
