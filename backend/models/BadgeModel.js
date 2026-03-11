const { PrismaClient } = require('@prisma/client');

class BadgeModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(filters = {}) {
    try {
      const badges = await this.prisma.badge.findMany({
        where: filters,
        include: {
          employe: true
        }
      });
      return badges;
    } catch (error) {
      console.error('Erreur getAll badges:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const badge = await this.prisma.badge.findUnique({
        where: { id: parseInt(id) },
        include: {
          employe: true
        }
      });
      return badge;
    } catch (error) {
      console.error('Erreur getById badge:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const badge = await this.prisma.badge.create({
        data: {
          ...data,
          dateExp: data.dateExp || new Date('2025-12-31')
        },
        include: {
          employe: true
        }
      });
      return badge;
    } catch (error) {
      console.error('Erreur create badge:', error);
      throw error;
    }
  }

  async getByEmployeId(employeId) {
    try {
      const badges = await this.prisma.badge.findMany({
        where: { employeId: parseInt(employeId) },
        include: {
          employe: true
        }
      });
      return badges;
    } catch (error) {
      console.error('Erreur getByEmployeId badge:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const badge = await this.prisma.badge.update({
        where: { id: parseInt(id) },
        data,
        include: {
          employe: true
        }
      });
      return badge;
    } catch (error) {
      console.error('Erreur update badge:', error);
      throw error;
    }
  }

  async updateStatus(id, statut) {
    try {
      const badge = await this.prisma.badge.update({
        where: { id: parseInt(id) },
        data: { statut },
        include: {
          employe: true
        }
      });
      return badge;
    } catch (error) {
      console.error('Erreur updateStatus badge:', error);
      throw error;
    }
  }

  async regenerate(id) {
    try {
      const badge = await this.prisma.badge.findUnique({
        where: { id: parseInt(id) },
        include: { employe: true }
      });
      
      if (!badge) throw new Error('Badge non trouvé');
      
      const newQrCode = `QR_${badge.employe.email}_${Date.now()}`;
      
      const updatedBadge = await this.prisma.badge.update({
        where: { id: parseInt(id) },
        data: { qrCode: newQrCode },
        include: {
          employe: true
        }
      });
      
      return updatedBadge;
    } catch (error) {
      console.error('Erreur regenerate badge:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.badge.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete badge:', error);
      throw error;
    }
  }
}

module.exports = BadgeModel;
