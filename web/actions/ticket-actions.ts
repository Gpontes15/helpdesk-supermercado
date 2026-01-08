'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"

// 1. CRIAR CHAMADO
export async function createTicket(formData: FormData) {
  // Descobrir quem está logado
  const user = await getCurrentUser()
  
  // Se não tiver ninguém logado, manda pro login
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const storeId = formData.get('storeId') as string
  const priority = formData.get('priority') as any
  
  // Usar o ID real do usuário logado
  await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      storeId,
      authorId: user.id,
      categoryId: 1 // Categoria padrão "Hardware" por enquanto
    }
  })

  // Atualiza a Home e redireciona
  revalidatePath('/')
  redirect('/')
}

// 2. FECHAR CHAMADO (NOVO)
export async function closeTicket(formData: FormData) {
  const ticketId = parseInt(formData.get('ticketId') as string)

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'CLOSED',
      closedAt: new Date() // Marca a hora exata que fechou
    }
  })

  // Atualiza todas as listas onde o chamado aparece
  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
}

// 3. REABRIR CHAMADO (NOVO)
export async function reopenTicket(formData: FormData) {
  const ticketId = parseInt(formData.get('ticketId') as string)

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'IN_PROGRESS', // Volta para em andamento
      closedAt: null // Remove a data de fechamento
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
}