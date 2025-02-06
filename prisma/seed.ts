import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear roles iniciales si no existen
  const roles = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'usuario' },
  ];

  for (const role of roles) {
    const existingRole = await prisma.rol.findUnique({ where: { id: role.id } });
    if (!existingRole) {
      await prisma.rol.create({ data: role });
    }
  }

  console.log('Roles creados exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });