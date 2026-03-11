const { PrismaClient } = require('@prisma/client');

class DemandeModel {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAll(filters = {}) {
    try {
      const demandes = await this.prisma.demande.findMany({
        where: filters,
        include: {
          employe: true
        },
        orderBy: {
          dateDebut: 'desc'
        }
      });
      return demandes;
    } catch (error) {
      console.error('Erreur getAll demandes:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const demande = await this.prisma.demande.findUnique({
        where: { id: parseInt(id) },
        include: {
          employe: true
        }
      });
      return demande;
    } catch (error) {
      console.error('Erreur getById demande:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const demande = await this.prisma.demande.create({
        data: {
          ...data,
          dateDebut: new Date(data.dateDebut),
          dateFin: new Date(data.dateFin)
        },
        include: {
          employe: true
        }
      });
      return demande;
    } catch (error) {
      console.error('Erreur create demande:', error);
      throw error;
    }
  }

  async getByEmployeId(employeId) {
    try {
      const demandes = await this.prisma.demande.findMany({
        where: { employeId: parseInt(employeId) },
        include: {
          employe: true
        },
        orderBy: {
          dateDebut: 'desc'
        }
      });
      return demandes;
    } catch (error) {
      console.error('Erreur getByEmployeId demande:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const demande = await this.prisma.demande.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
          dateFin: data.dateFin ? new Date(data.dateFin) : undefined
        },
        include: {
          employe: true
        }
      });
      return demande;
    } catch (error) {
      console.error('Erreur update demande:', error);
      throw error;
    }
  }

  async updateStatus(id, statut) {
    try {
      const demande = await this.prisma.demande.update({
        where: { id: parseInt(id) },
        data: { statut },
        include: {
          employe: true
        }
      });
      return demande;
    } catch (error) {
      console.error('Erreur updateStatus demande:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.prisma.demande.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      console.error('Erreur delete demande:', error);
      throw error;
    }
  }
}

module.exports = DemandeModel;
