const { PrismaClient } = require('@prisma/client');

class PointageModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(filters = {}) {
    try {
      const pointages = await this.prisma.pointage.findMany({
        where: filters,
        include: {
          employe: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      return pointages;
    } catch (error) {
      console.error('Erreur getAll pointages:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const pointage = await this.prisma.pointage.findUnique({
        where: { id: parseInt(id) },
        include: {
          employe: true
        }
      });
      return pointage;
    } catch (error) {
      console.error('Erreur getById pointage:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const pointage = await this.prisma.pointage.create({
        data: {
          ...data,
          timestamp: data.timestamp || new Date()
        },
        include: {
          employe: true
        }
      });
      return pointage;
    } catch (error) {
      console.error('Erreur create pointage:', error);
      throw error;
    }
  }

  async getByEmployeId(employeId, filters = {}) {
    try {
      const pointages = await this.prisma.pointage.findMany({
        where: {
          employeId: parseInt(employeId),
          ...filters
        },
        include: {
          employe: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      return pointages;
    } catch (error) {
      console.error('Erreur getByEmployeId pointage:', error);
      throw error;
    }
  }

  async getLatest(limit = 20) {
    try {
      const pointages = await this.prisma.pointage.findMany({
        take: limit,
        include: {
          employe: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      return pointages;
    } catch (error) {
      console.error('Erreur getLatest pointages:', error);
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  }

  async getByPeriod(startDate, endDate) {
    try {
      const pointages = await this.prisma.pointage.findMany({
        where: {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          employe: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      return pointages;
    } catch (error) {
      console.error('Erreur getByPeriod pointages:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const pointage = await this.prisma.pointage.update({
        where: { id: parseInt(id) },
        data,
        include: {
          employe: true
        }
      });
      return pointage;
    } catch (error) {
      console.error('Erreur update pointage:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.pointage.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete pointage:', error);
      throw error;
    }
  }
}

module.exports = PointageModel;
