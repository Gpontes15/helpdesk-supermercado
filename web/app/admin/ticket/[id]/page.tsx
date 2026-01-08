import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { closeTicket, reopenTicket } from "@/actions/ticket-actions" // <--- Importante: Importando as ações

// Action local para atualizar apenas a data
async function updateTicketDeadline(formData: FormData) {
  'use server'
  const ticketId = parseInt(formData.get('ticketId') as string)
  const dateStr = formData.get('deadline') as string
  
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { 
      estimatedTime: new Date(dateStr),
      status: 'IN_PROGRESS' 
    }
  })
  revalidatePath(`/admin/ticket/${ticketId}`)
}

export default async function AdminTicketDetails({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: { store: true, author: true }
  })

  if (!ticket) return <div>Chamado não encontrado</div>

  // Verifica se está fechado para mudar a cor da tela
  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* CABEÇALHO: Fica verde se fechado, escuro se aberto */}
        <div className={`${isClosed ? 'bg-green-700' : 'bg-slate-800'} p-6 text-white flex justify-between items-center`}>
          <div>
            <h1 className="text-2xl font-bold">Chamado #{ticket.id}</h1>
            <p className="text-slate-200 text-sm">{ticket.store.name}</p>
          </div>
          <div className="text-right">
            <span className="bg-white/20 px-2 py-1 rounded font-bold text-sm block mb-1">
              {ticket.status}
            </span>
            <span className="text-red-300 font-bold text-sm">{ticket.priority}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: Detalhes */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-gray-500 text-sm uppercase font-bold">Título</h3>
              <p className="text-xl text-gray-900 font-medium">{ticket.title}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="text-gray-500 text-sm uppercase font-bold mb-2">Descrição do Usuário</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm uppercase font-bold">Solicitante</h3>
              <p className="text-gray-800">{ticket.author.name} ({ticket.author.email})</p>
              <p className="text-gray-500 text-xs font-bold mt-1 uppercase">{ticket.author.department || "Sem setor"}</p>
            </div>
          </div>

          {/* COLUNA DIREITA: Painel de Ações */}
          <div className="space-y-6">
            
            {/* Se estiver FECHADO, mostra aviso e opção de reabrir */}
            {isClosed ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <p className="text-green-800 font-bold text-lg mb-2">✅ Finalizado</p>
                <p className="text-sm text-green-600 mb-4">
                  Fechado em: <br/>{ticket.closedAt?.toLocaleString('pt-BR')}
                </p>
                
                <form action={reopenTicket}>
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <button className="text-xs text-gray-500 underline hover:text-black">
                    Reabrir chamado (Desfazer)
                  </button>
                </form>
              </div>
            ) : (
              // Se estiver ABERTO, mostra as ações
              <>
                <div className="bg-white p-4 rounded border shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">📅 Agendar Prazo</h3>
                  <form action={updateTicketDeadline} className="space-y-3">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input 
                      type="datetime-local" 
                      name="deadline"
                      className="w-full border p-2 rounded text-sm text-black"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-bold">
                      Salvar Previsão
                    </button>
                  </form>
                  {ticket.estimatedTime && (
                    <div className="mt-3 text-xs text-blue-800 bg-blue-50 p-2 rounded">
                      Previsão atual: <strong>{ticket.estimatedTime.toLocaleString('pt-BR')}</strong>
                    </div>
                  )}
                </div>

                {/* BOTÃO DE FECHAR QUE FALTAVA */}
                <form action={closeTicket}>
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold shadow-md transition flex flex-col items-center gap-1"
                  >
                    <span>✓ Finalizar Chamado</span>
                    <span className="text-[10px] font-normal opacity-90">Marcar como resolvido</span>
                  </button>
                </form>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}