const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createUser = async (data) => {
  try {
    const user = await prisma.user.create({
      data,
    });
    return user;
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};

const updateUser = async (id, data) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  } catch (error) {
    throw new Error('Error updating user: ' + error.message);
  }
};

const deleteUser = async (id) => {
  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message);
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
};