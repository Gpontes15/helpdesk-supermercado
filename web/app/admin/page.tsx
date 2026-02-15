import { prisma } from "@/lib/db"
import Link from "next/link"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { DeleteTicketButton } from "@/components/DeleteTicketButton" // <--- Importamos o botão aqui

export const dynamic = 'force-dynamic'

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
}

const statusColors: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  CLOSED: "bg-gray-100 text-gray-800",
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  // Segurança: Se não for ADMIN ou TECH, manda embora
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TECH')) {
    redirect('/')
  }

  // Busca apenas chamados ABERTOS ou EM ANDAMENTO para a fila (os fechados ficam no histórico)
  const tickets = await prisma.ticket.findMany({
    where: {
      status: { not: 'CLOSED' }
    },
    orderBy: { createdAt: 'desc' },
    include: { store: true, author: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO COM BOTÕES DE NAVEGAÇÃO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Fila de Atendimento</h1>
            <p className="text-gray-500 text-sm">Gerencie os chamados pendentes</p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin/estoque" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-sm font-bold transition flex items-center gap-2">
              📦 Gerenciar Estoque
            </Link>
            <Link href="/admin/relatorios" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 font-bold transition shadow-sm">
              📜 Histórico / Relatórios
            </Link>
          </div>
        </div>

        {/* TABELA DE CHAMADOS */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loja</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Problema</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                       Nenhum chamado pendente na fila! 🎉
                    </td>
                 </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">#{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.store.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-bold text-gray-800">{ticket.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                           👤 {ticket.author.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                        {ticket.status === 'OPEN' ? 'ABERTO' : ticket.status === 'IN_PROGRESS' ? 'EM ANÁLISE' : ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-3">
                      
                      {/* LINK DE GERENCIAR (ATENDER) */}
                      <Link href={`/admin/ticket/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition">
                        Atender
                      </Link>

                      {/* BOTÃO DE DELETAR (NOVO!) */}
                      <DeleteTicketButton id={ticket.id} />
                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}