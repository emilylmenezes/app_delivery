const express = require('express');
const {
    getUsersHandler,
    deleteUserById,
} = require('../controllers/userController');
const getUser = require('../middleware/getUserByToken');

const userRouter = express.Router();

userRouter.use(getUser);

userRouter.get('/', getUsersHandler);
userRouter.get('/admin', getUsersHandler);
userRouter.delete('/admin/:id', deleteUserById);

module.exports = userRouter;
