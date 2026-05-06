const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'areasistemas@hierroshb.com';
  const password = '@C4rt0n2022*';
  
  // Hashear contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    if (existingUser.role !== 'Admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'Admin', password: hashedPassword }
      });
      console.log('Usuario existente actualizado a rol Admin y contraseña reseteada.');
    } else {
      console.log('El usuario Admin ya existe.');
    }
  } else {
    await prisma.user.create({
      data: {
        razonSocial: 'Administrador HHB',
        nombre: 'Administrador',
        email: email,
        password: hashedPassword,
        role: 'Admin'
      }
    });
    console.log('Usuario Admin creado exitosamente.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
