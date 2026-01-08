import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function UserTicketDetail({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id) },
    include: { store: true, author: true }
  })

  if (!ticket) return <div className="p-8">Chamado não encontrado</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden h-fit">
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Chamado #{ticket.id}</h1>
          <span className="bg-blue-500 px-3 py-1 rounded text-sm">{ticket.status}</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Aviso de Prazo do TI */}
          {ticket.estimatedTime ? (
             <div className="bg-green-50 border border-green-200 p-4 rounded-md">
               <h3 className="text-green-800 font-bold flex items-center gap-2">
                 📅 Previsão de Solução
               </h3>
               <p className="text-green-700 mt-1">
                 O técnico agendou a resolução para: <strong className="text-lg">{ticket.estimatedTime.toLocaleString('pt-BR')}</strong>
               </p>
             </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <p className="text-yellow-800">Aguardando análise de prazo pela equipe de TI.</p>
            </div>
          )}

          <div>
            <label className="text-gray-500 text-sm font-bold uppercase">Problema</label>
            <p className="text-xl text-gray-800 font-medium">{ticket.title}</p>
            <p className="text-gray-600 mt-2 bg-gray-50 p-3 rounded">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-gray-500 text-sm font-bold uppercase">Loja</label>
                <p className="text-gray-800">{ticket.store.name}</p>
             </div>
             <div>
                <label className="text-gray-500 text-sm font-bold uppercase">Abertura</label>
                <p className="text-gray-800">{ticket.createdAt.toLocaleDateString('pt-BR')}</p>
             </div>
          </div>
          
          <div className="pt-6 border-t flex justify-end">
            <Link href="/meus-chamados" className="text-blue-600 hover:underline">
              Voltar para lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}