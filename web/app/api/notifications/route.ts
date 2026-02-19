import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth-actions"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const user = await getCurrentUser()
  
  // Pega a data atual do servidor para o relógio ficar sincronizado
  const now = new Date().toISOString()

  if (!user) return NextResponse.json({ notifications: [], timestamp: now })

  const { searchParams } = new URL(request.url)
  const sinceParam = searchParams.get('since')

  // Se é a primeira vez que a página carrega, devolve só a hora atual
  if (!sinceParam) {
    return NextResponse.json({ notifications: [], timestamp: now })
  }

  const sinceDate = new Date(sinceParam)
  
  // CORREÇÃO AQUI: Avisando ao TypeScript o que vai dentro do Array
  let notifications: { title: string, body: string }[] = []

  // LÓGICA 1: SE FOR DA TI (Recebe aviso de novos chamados)
  if (user.role === 'ADMIN' || user.role === 'TECH') {
    const newTickets = await prisma.ticket.findMany({
      where: { createdAt: { gt: sinceDate } },
      include: { store: true }
    })
    
    newTickets.forEach(t => {
      notifications.push({
        title: '🚨 Novo Chamado na Fila!',
        body: `${t.store.name}: ${t.title}`
      })
    })
  } 
  
  // LÓGICA 2: SE FOR USUÁRIO COMUM (Recebe aviso de atualizações)
  else {
    const updatedTickets = await prisma.ticket.findMany({
      where: { 
        authorId: user.id, 
        updatedAt: { gt: sinceDate },
        createdAt: { lte: sinceDate } 
      }
    })

    updatedTickets.forEach(t => {
      let msg = 'Seu chamado foi atualizado.'
      if (t.status === 'IN_PROGRESS') msg = 'A TI acabou de visualizar e está analisando seu chamado 👀'
      if (t.status === 'CLOSED') msg = 'Seu chamado foi resolvido e finalizado! ✅'
      
      notifications.push({
        title: `Chamado #${t.id} Atualizado`,
        body: msg
      })
    })
  }

  return NextResponse.json({ notifications, timestamp: now })
}