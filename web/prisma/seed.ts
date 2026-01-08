const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Criar Categorias
  await prisma.category.createMany({
    data: [
      { name: 'Hardware / Equipamentos' },
      { name: 'Software / Sistema' },
      { name: 'Rede / Internet' },
      { name: 'Impressoras' },
      { name: 'Outros' },
    ],
    skipDuplicates: true,
  })

  // 2. Criar Lojas (Novas lojas adicionadas)
  await prisma.store.createMany({
    data: [
      { code: '001', name: 'Loja Matriz' },
      { code: '002', name: 'Loja Baturite' },
      { code: '003', name: 'Loja Barreira' },
      { code: '004', name: 'Loja Aracoiaba' },
    ],
    skipDuplicates: true,
  })

  // 3. Criar Usuários de Teste
  const password = "123" // Senha padrão

  // TI
  await prisma.user.upsert({
    where: { email: 'ti@mercado.com' },
    update: {},
    create: {
      email: 'ti@mercado.com',
      name: 'Carlos (TI)',
      password: password,
      role: 'ADMIN',
      department: 'Tecnologia'
    }
  })

  // Caixa
  await prisma.user.upsert({
    where: { email: 'caixa@mercado.com' },
    update: {},
    create: {
      email: 'caixa@mercado.com',
      name: 'Maria (Frente de Caixa)',
      password: password,
      role: 'USER',
      department: 'Frente de Caixa'
    }
  })

  // Açougue
  await prisma.user.upsert({
    where: { email: 'acougue@mercado.com' },
    update: {},
    create: {
      email: 'acougue@mercado.com',
      name: 'João (Açougueiro)',
      password: password,
      role: 'USER',
      department: 'Açougue'
    }
  })

  console.log('Banco populado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })