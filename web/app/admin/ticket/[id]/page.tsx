import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { closeTicket, reopenTicket } from "@/actions/ticket-actions"

// Action local para atualizar data
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
      author: true
    }
  })

  if (!ticket) return <div>Chamado não encontrado</div>

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className={`${isClosed ? 'bg-green-700' : 'bg-slate-800'} p-6 text-white flex justify-between items-center`}>
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
            <h3 className="text-gray-500 text-sm uppercase font-bold">Problema Relatado</h3>
            <p className="text-xl text-gray-900 font-medium">{ticket.title}</p>
            <div className="mt-2 p-3 bg-gray-50 border rounded text-gray-700 whitespace-pre-wrap">
                {ticket.description}
            </div>
            </div>

            <div>
            <h3 className="text-gray-500 text-sm uppercase font-bold">Solicitante</h3>
            <p className="text-gray-800 font-bold">{ticket.author.name}</p>
            <p className="text-sm text-gray-500">{ticket.author.department || "Sem setor"}</p>
            </div>

            {/* --- ÁREA DE AÇÕES --- */}
            <div className="border-t pt-6">
            
            {isClosed ? (
                /* --- SE FECHADO: MOSTRA A SOLUÇÃO --- */
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <div>
                    <p className="text-green-800 font-bold text-lg">Chamado Finalizado</p>
                    <p className="text-xs text-green-600">
                        Encerrado em: {ticket.closedAt?.toLocaleString('pt-BR')}
                    </p>
                    </div>
                </div>

                <div className="bg-white p-3 rounded border border-green-100 mt-2">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Solução Aplicada:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{ticket.solution}</p>
                </div>
                
                {/* Botão de Reabrir */}
                <form action={reopenTicket} className="mt-4 text-center">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <button className="text-xs text-gray-500 underline hover:text-black">
                    Reabrir chamado (Desfazer)
                    </button>
                </form>
                </div>
            ) : (
                /* --- SE ABERTO: MOSTRA FORMULÁRIOS --- */
                <div className="space-y-6">
                
                {/* Agendar Data */}
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <form action={updateTicketDeadline} className="flex gap-2 items-end">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-blue-800 mb-1">Previsão de Atendimento</label>
                        <input type="datetime-local" name="deadline" className="w-full border p-2 rounded text-sm text-black" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700">
                        Agendar
                    </button>
                    </form>
                    {ticket.estimatedTime && (
                    <p className="text-xs text-blue-600 mt-2">
                        Agendado para: <strong>{ticket.estimatedTime.toLocaleString('pt-BR')}</strong>
                    </p>
                    )}
                </div>

                {/* Encerrar Chamado com Solução */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-2">Encerrar Atendimento</h3>
                    <form action={closeTicket}>
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    
                    <label className="block text-xs text-gray-500 mb-1 font-bold uppercase">O que foi feito para resolver? *</label>
                    <textarea 
                        name="solution" 
                        required 
                        placeholder="Ex: Trocado cabo de rede, reiniciado servidor..."
                        className="w-full border p-2 rounded text-sm h-24 mb-3 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                    ></textarea>

                    <button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold shadow-md transition flex justify-center gap-2"
                    >
                        ✓ Finalizar e Arquivar
                    </button>
                    </form>
                </div>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  )
}