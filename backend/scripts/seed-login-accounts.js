const path = require('path')
const bcrypt = require('bcrypt')
const { Client } = require('pg')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const ACCESS_ROLES = new Set(['employe', 'admin', 'super_admin'])

function toAccessRole(role) {
  if (ACCESS_ROLES.has(role)) {
    return role
  }
  return 'employe'
}

async function upsertAdmin(client, payload) {
  const query = `
    INSERT INTO admins (nom, prenom, email, password, role, statut, departement, poste, telephone, adresse)
    VALUES ($1, $2, $3, $4, $5::"Role", $6::"Statut", $7, $8, $9, $10)
    ON CONFLICT (email)
    DO UPDATE SET
      nom = EXCLUDED.nom,
      prenom = EXCLUDED.prenom,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      statut = EXCLUDED.statut,
      departement = EXCLUDED.departement,
      poste = EXCLUDED.poste,
      telephone = EXCLUDED.telephone,
      adresse = EXCLUDED.adresse
    RETURNING id, email, role;
  `

  const values = [
    payload.nom,
    payload.prenom,
    payload.email,
    payload.password,
    payload.role,
    payload.statut,
    payload.departement,
    payload.poste,
    payload.telephone,
    payload.adresse
  ]

  const { rows } = await client.query(query, values)
  return rows[0]
}

async function upsertEmploye(client, payload) {
  const query = `
    INSERT INTO employes (
      nom, prenom, email, password, role, statut, poste, departement, telephone, adresse, date_embauche, badge_actif
    )
    VALUES (
      $1, $2, $3, $4, $5::"Role", $6::"Statut", $7, $8, $9, $10, $11, $12
    )
    ON CONFLICT (email)
    DO UPDATE SET
      nom = EXCLUDED.nom,
      prenom = EXCLUDED.prenom,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      statut = EXCLUDED.statut,
      poste = EXCLUDED.poste,
      departement = EXCLUDED.departement,
      telephone = EXCLUDED.telephone,
      adresse = EXCLUDED.adresse,
      date_embauche = EXCLUDED.date_embauche,
      badge_actif = EXCLUDED.badge_actif
    RETURNING id, email, role;
  `

  const values = [
    payload.nom,
    payload.prenom,
    payload.email,
    payload.password,
    payload.role,
    payload.statut,
    payload.poste,
    payload.departement,
    payload.telephone,
    payload.adresse,
    payload.date_embauche,
    payload.badge_actif
  ]

  const { rows } = await client.query(query, values)
  return rows[0]
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL manquant dans backend/.env')
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const superAdminPassword = await bcrypt.hash('admin123', 10)
    const employePassword = await bcrypt.hash('employe123', 10)

    const superAdmin = await upsertAdmin(client, {
      nom: 'Diallo',
      prenom: 'Super',
      email: 'superadmin@xpertpro.local',
      password: superAdminPassword,
      role: 'super_admin',
      statut: 'actif',
      departement: 'administration',
      poste: 'Super Administrateur',
      telephone: '700000001',
      adresse: 'Bamako'
    })

    const employes = [
      {
        nom: 'Traore',
        prenom: 'Alice',
        email: 'alice.traore@xpertpro.local',
        role: 'employe',
        poste: 'Assistante RH',
        departement: 'ressources_humaines',
        telephone: '700000011'
      },
      {
        nom: 'Coulibaly',
        prenom: 'Moussa',
        email: 'moussa.coulibaly@xpertpro.local',
        role: 'employe',
        poste: 'Manager Operationnel',
        departement: 'operations',
        telephone: '700000012'
      },
      {
        nom: 'Keita',
        prenom: 'Fatou',
        email: 'fatou.keita@xpertpro.local',
        role: 'employe',
        poste: 'Chef de Departement IT',
        departement: 'informatique',
        telephone: '700000013'
      },
      {
        nom: 'Sissoko',
        prenom: 'Ibrahim',
        email: 'ibrahim.sissoko@xpertpro.local',
        role: 'employe',
        poste: 'Comptable',
        departement: 'finance',
        telephone: '700000014'
      },
      {
        nom: 'Camara',
        prenom: 'Awa',
        email: 'awa.camara@xpertpro.local',
        role: 'employe',
        poste: 'Stagiaire Developpement',
        departement: 'informatique',
        telephone: '700000015'
      }
    ]

    const createdEmployes = []
    for (const employe of employes) {
      // Sequential by design to keep write load predictable on shared DB.
      // eslint-disable-next-line no-await-in-loop
      const row = await upsertEmploye(client, {
        ...employe,
        role: toAccessRole(employe.role),
        password: employePassword,
        statut: 'actif',
        adresse: 'Bamako',
        date_embauche: new Date('2026-01-15'),
        badge_actif: true
      })
      createdEmployes.push(row)
    }

    console.log('Compte super_admin pret:', superAdmin)
    console.log('Employes prets:', createdEmployes)
    console.log('Mot de passe super_admin: admin123')
    console.log('Mot de passe employes: employe123')
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Erreur seed comptes login:', error)
  process.exit(1)
})
