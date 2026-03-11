const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

class AdminModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll() {
    try {
      const admins = await this.prisma.admin.findMany();
      return admins;
    } catch (error) {
      console.error('Erreur getAll admins:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: parseInt(id) }
      });
      return admin;
    } catch (error) {
      console.error('Erreur getById admin:', error);
      throw error;
    }
  }

  async getByEmail(email) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { email }
      });
      return admin;
    } catch (error) {
      console.error('Erreur getByEmail admin:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const admin = await this.prisma.admin.create({
        data: {
          ...data,
          password: hashedPassword
        }
      });
      return admin;
    } catch (error) {
      console.error('Erreur create admin:', error);
      throw error;
    }
  }

  async authenticate(email, password) {
    try {
      const admin = await this.getByEmail(email);
      if (!admin) return null;
      
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) return null;
      
      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    } catch (error) {
      console.error('Erreur authenticate admin:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const admin = await this.prisma.admin.update({
        where: { id: parseInt(id) },
        data
      });
      return admin;
    } catch (error) {
      console.error('Erreur update admin:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.admin.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete admin:', error);
      throw error;
    }
  }
}

module.exports = AdminModel;
