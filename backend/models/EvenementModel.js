const { PrismaClient } = require('@prisma/client');

class EvenementModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(filters = {}) {
    try {
      const evenements = await this.prisma.evenement.findMany({
        where: filters,
        take: 50,
        orderBy: {
          date: 'desc'
        }
      });
      return evenements;
    } catch (error) {
      console.error('Erreur getAll evenements:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const evenement = await this.prisma.evenement.findUnique({
        where: { id: parseInt(id) }
      });
      return evenement;
    } catch (error) {
      console.error('Erreur getById evenement:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const evenement = await this.prisma.evenement.create({
        data: {
          ...data,
          date: data.date || new Date()
        }
      });
      return evenement;
    } catch (error) {
      console.error('Erreur create evenement:', error);
      throw error;
    }
  }

  async getByEmployeId(employeId) {
    try {
      const evenements = await this.prisma.evenement.findMany({
        where: { employeId: parseInt(employeId) },
        orderBy: {
          date: 'desc'
        }
      });
      return evenements;
    } catch (error) {
      console.error('Erreur getByEmployeId evenement:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const evenement = await this.prisma.evenement.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined
        }
      });
      return evenement;
    } catch (error) {
      console.error('Erreur update evenement:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.evenement.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete evenement:', error);
      throw error;
    }
  }
}

module.exports = EvenementModel;
