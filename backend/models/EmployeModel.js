const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

class EmployeModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(filters = {}) {
    try {
      const employes = await this.prisma.employe.findMany({
        where: filters
      });
      return employes;
    } catch (error) {
      console.error('Erreur getAll employes:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const employe = await this.prisma.employe.findUnique({
        where: { id: parseInt(id) }
      });
      return employe;
    } catch (error) {
      console.error('Erreur getById employe:', error);
      throw error;
    }
  }

  async getByEmail(email) {
    try {
      const employe = await this.prisma.employe.findUnique({
        where: { email }
      });
      return employe;
    } catch (error) {
      console.error('Erreur getByEmail employe:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const employe = await this.prisma.employe.create({
        data: {
          ...data,
          password: hashedPassword
        }
      });
      return employe;
    } catch (error) {
      console.error('Erreur create employe:', error);
      throw error;
    }
  }

  async authenticate(email, password) {
    try {
      const employe = await this.getByEmail(email);
      if (!employe) return null;
      
      const isValid = await bcrypt.compare(password, employe.password);
      if (!isValid) return null;
      
      const { password: _, ...employeWithoutPassword } = employe;
      return employeWithoutPassword;
    } catch (error) {
      console.error('Erreur authenticate employe:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const employe = await this.prisma.employe.update({
        where: { id: parseInt(id) },
        data
      });
      return employe;
    } catch (error) {
      console.error('Erreur update employe:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.employe.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete employe:', error);
      throw error;
    }
  }
}

module.exports = EmployeModel;
