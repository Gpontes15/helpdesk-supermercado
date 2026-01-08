import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function MyTickets() {
  // Pegamos o usuário "fake" Admin (no futuro será o user logado na sessão)
  const user = await prisma.user.findFirst()

  const tickets = await prisma.ticket.findMany({
    where: { authorId: user?.id }, // Filtra só os meus
    orderBy: { createdAt: 'desc' },
    include: { store: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Meus Chamados</h1>
        
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">#{t.id} - {t.title}</h3>
                <p className="text-gray-500 text-sm">{t.store.name}</p>
                <div className="mt-2">
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-2">
                    {t.status}
                  </span>
                  
                  {/* Se o TI definiu um prazo manual, mostramos aqui */}
                  {t.estimatedTime && (
                    <span className="text-orange-600 text-xs font-bold">
                      📅 TI Agendou para: {t.estimatedTime.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Link href={`/meus-chamados/${t.id}`} className="text-blue-600 text-sm hover:underline">
                  Ver detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}