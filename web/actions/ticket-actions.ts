'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"

// 1. CRIAR CHAMADO (Mantido igual)
export async function createTicket(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const storeId = formData.get('storeId') as string
  const priority = formData.get('priority') as any
  
  await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      storeId,
      authorId: user.id,
      categoryId: 1 
    }
  })

  revalidatePath('/')
  redirect('/')
}

// 2. FECHAR CHAMADO (ATUALIZADO: Salva Solução + Quem Fechou)
export async function closeTicket(formData: FormData) {
  // Pegamos quem está clicando no botão (o técnico logado)
  const user = await getCurrentUser()
  
  if (!user) return // Segurança: se não estiver logado, não faz nada

  const ticketId = parseInt(formData.get('ticketId') as string)
  const solution = formData.get('solution') as string

  // Validação: Se não escreveu nada na solução, bloqueia
  if (!solution || solution.trim() === "") {
    return
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      solution: solution,
      closedById: user.id // <--- AQUI ESTÁ A MÁGICA: Salva o ID do técnico para o relatório
    }
  })

  // Atualiza as telas importantes
  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios') // Adicionei essa para o gráfico atualizar na hora!
}

// 3. REABRIR CHAMADO (Mantido igual)
export async function reopenTicket(formData: FormData) {
  const ticketId = parseInt(formData.get('ticketId') as string)

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'IN_PROGRESS',
      closedAt: null,
      // Nota: Não limpamos 'closedById' nem 'solution' para manter histórico, 
      // mas eles serão sobrescritos se fechar de novo.
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios')
}