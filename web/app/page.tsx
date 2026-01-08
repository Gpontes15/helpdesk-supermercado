import { prisma } from "@/lib/db"
import { TicketForm } from "@/components/TicketForm"
import { getCurrentUser, logout } from "@/actions/auth-actions" // Importar logout e user
import { redirect } from "next/navigation"

export default async function Home() {
  // 1. Proteção: Se não logou, tchau!
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const stores = await prisma.store.findMany({ select: { id: true, name: true } })

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {/* Cabeçalho com o nome de quem logou */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Olá, {user.name}</h1>
            <p className="text-xs text-gray-500 font-bold uppercase">{user.department || "Sem setor"}</p>
          </div>
          <form action={logout}>
            <button className="text-xs text-red-500 hover:underline">Sair</button>
          </form>
        </div>

        <h2 className="text-lg font-bold mb-4 text-gray-700">Abrir Novo Chamado</h2>
        <TicketForm stores={stores} />
        
      </div>
    </main>
  )
}