'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"

// Validação simples para evitar dados vazios
const TicketSchema = {
  title: (val: string) => val && val.length > 3,
  description: (val: string) => val && val.length > 5,
}

// 1. CRIAR CHAMADO
export async function createTicket(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  
  // --- LÓGICA DE SELEÇÃO DE LOJA ---
  // 1. Tenta pegar a loja enviada pelo Select do formulário
  const formStoreId = formData.get('storeId') as string
  
  // 2. Se não tiver (ex: usuário comum), usa a loja do próprio usuário logado
  // 3. O fallback "|| user.storeId" garante que ninguém fique sem loja
  const finalStoreId = formStoreId || user.storeId

  if (!finalStoreId) {
    // Se chegar aqui, é porque o usuário não tem loja e não selecionou nenhuma.
    // Você pode redirecionar com erro ou lançar uma exceção.
    throw new Error("Erro Crítico: Não foi possível identificar a loja para este chamado.")
  }

  // Validação básica de texto
  if (!TicketSchema.title(title) || !TicketSchema.description(description)) {
    // Em produção, você retornaria um erro visual, aqui vamos só ignorar/retornar
    return 
  }

  // --- CATEGORIZAÇÃO AUTOMÁTICA (Opcional, mas muito útil) ---
  // Tenta adivinhar a categoria pelo texto para ajudar nos relatórios depois
  let categoryId = 5 // ID 5 = Outros (Padrão)
  const text = (title + " " + description).toLowerCase()
  
  if (text.includes('impressora') || text.includes('toner') || text.includes('papel')) categoryId = 4
  if (text.includes('wifi') || text.includes('internet') || text.includes('rede') || text.includes('lento')) categoryId = 3
  if (text.includes('sistema') || text.includes('rub') || text.includes('winthor') || text.includes('vr')) categoryId = 2
  if (text.includes('pc') || text.includes('computador') || text.includes('monitor') || text.includes('teclado')) categoryId = 1

  await prisma.ticket.create({
    data: {
      title,
      description,
      priority: priority || 'LOW',
      status: 'OPEN',
      authorId: user.id,
      storeId: finalStoreId, // <--- Usa a loja correta aqui
      categoryId: categoryId 
    }
  })

  // Revalida as páginas para aparecer o chamado novo na hora
  revalidatePath('/')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin') 
  redirect('/meus-chamados')
}

// 2. FECHAR CHAMADO
export async function closeTicket(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user) return 

  const ticketId = parseInt(formData.get('ticketId') as string)
  const solution = formData.get('solution') as string

  if (!solution || solution.trim() === "") {
    return
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      solution: solution,
      closedById: user.id // Salva quem fechou para o ranking de produtividade
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios')
}

// 3. REABRIR CHAMADO
export async function reopenTicket(formData: FormData) {
  const ticketId = parseInt(formData.get('ticketId') as string)

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: 'IN_PROGRESS',
      closedAt: null,
      // Não limpamos 'closedById' nem 'solution' para manter histórico visual, 
      // mas a lógica de relatório deve contar apenas status='CLOSED'
    }
  })

  revalidatePath(`/admin/ticket/${ticketId}`)
  revalidatePath('/admin')
  revalidatePath('/meus-chamados')
  revalidatePath('/admin/relatorios')
}