const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class User {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.displayName = data.displayName;
    this.allergies = data.allergies;
    this.preferences = data.preferences;
    this.dietStyle = data.dietStyle;
    this.productsToAvoid = data.productsToAvoid;
    this.budget = data.budget;
    this.gdprGeolocation = data.gdprGeolocation;
    this.gdprData = data.gdprData;
  }

  static async createUser(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        allergies: data.allergies,
        preferences: data.preferences,
        dietStyle: data.dietStyle,
        productsToAvoid: data.productsToAvoid,
        budget: data.budget,
        gdprGeolocation: data.gdprGeolocation,
        gdprData: data.gdprData,
      },
    });
  }

  static async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async updateUser(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  static async deleteUser(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = User;