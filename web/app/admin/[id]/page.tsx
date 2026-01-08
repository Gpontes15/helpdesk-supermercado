import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { TicketChat } from "@/components/TicketChat"
import { closeTicket, reopenTicket } from "@/actions/ticket-actions" // <--- Importamos as novas ações

// Action para atualizar o prazo (mantida localmente pois é específica desta página)
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
    include: { 
      store: true, 
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!ticket) return <div>Chamado não encontrado</div>

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Coluna da Esquerda: Detalhes e Ações */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Cabeçalho muda de cor se estiver fechado */}
            <div className={`${isClosed ? 'bg-green-700' : 'bg-slate-800'} p-6 text-white flex justify-between`}>
               <div>
                 <h1 className="text-2xl font-bold">Chamado #{ticket.id}</h1>
                 <p className="opacity-80 text-sm">{ticket.store.name}</p>
               </div>
               <div className="text-right">
                  <div className="font-bold border px-2 rounded mb-1 bg-white/20">{ticket.status}</div>
                  <div className="text-sm font-bold text-red-300">{ticket.priority}</div>
               </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-gray-500 text-sm uppercase font-bold">Título</h3>
                <p className="text-xl text-gray-900 font-medium">{ticket.title}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* --- ÁREA DE AÇÕES --- */}
              <div className="border-t pt-6">
                
                {isClosed ? (
                  <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                    <p className="text-green-800 font-bold text-lg mb-2">✅ Chamado Finalizado</p>
                    <p className="text-sm text-green-600 mb-4">
                      Fechado em: {ticket.closedAt?.toLocaleString('pt-BR')}
                    </p>
                    
                    {/* Botão de Reabrir (caso tenha fechado errado) */}
                    <form action={reopenTicket}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <button className="text-sm text-gray-500 underline hover:text-gray-800">
                        Reabrir chamado
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Painel de Data */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                      <form action={updateTicketDeadline} className="space-y-4">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <label className="block text-sm font-medium text-gray-700">Definir Previsão</label>
                        <div className="flex gap-2">
                          <input type="datetime-local" name="deadline" className="w-full border p-2 rounded text-sm text-black" />
                          <button type="submit" className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 text-sm font-bold">Salvar</button>
                        </div>
                      </form>
                      {ticket.estimatedTime && (
                        <p className="text-xs text-blue-600 mt-2">
                          Atual: <strong>{ticket.estimatedTime.toLocaleString('pt-BR')}</strong>
                        </p>
                      )}
                    </div>

                    {/* BOTÃO DE FECHAR CHAMADO */}
                    <form action={closeTicket}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold text-lg shadow-md transition flex items-center justify-center gap-2"
                      >
                        ✓ Finalizar e Fechar Chamado
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Chat */}
        <div className="h-full">
           <TicketChat ticketId={ticket.id} comments={ticket.comments} />
        </div>

      </div>
    </div>
  )
}