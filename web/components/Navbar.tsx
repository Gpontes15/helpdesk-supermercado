import Link from "next/link"
import { getCurrentUser, logout } from "@/actions/auth-actions"

export async function Navbar() {
  const user = await getCurrentUser()

  // Se não estiver logado, não mostra a barra (ou mostra só link de entrar)
  if (!user) return null

  const isAdmin = user.role === 'ADMIN'

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Lado Esquerdo: Logo e Links Principais */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl tracking-wider text-blue-400">
              HELPDESK
            </Link>
            
            <div className="hidden md:flex items-baseline space-x-4">
              <Link href="/" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">
                Abrir Chamado
              </Link>
              
              <Link href="/meus-chamados" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">
                Meus Chamados
              </Link>

              {/* LINKS SÓ PARA ADMIN */}
              {isAdmin && (
                <>
                  <Link href="/admin" className="bg-blue-900 hover:bg-blue-800 text-blue-100 px-3 py-2 rounded-md text-sm font-medium border border-blue-700">
                    Gerenciar Fila
                  </Link>
                  
                  <Link href="/admin/relatorios" className="hover:bg-slate-700 text-green-200 px-3 py-2 rounded-md text-sm font-medium">
                    📊 Relatórios
                  </Link>

                  <Link href="/admin/usuarios" className="hover:bg-slate-700 text-yellow-100 px-3 py-2 rounded-md text-sm font-medium">
                    Cadastrar Usuários
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Lado Direito: Perfil e Sair */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-xs text-gray-400">{user.department || "Sem setor"}</div>
            </div>
            
            <form action={logout}>
              <button className="text-sm text-red-400 hover:text-red-300 font-bold border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20 transition">
                Sair
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}