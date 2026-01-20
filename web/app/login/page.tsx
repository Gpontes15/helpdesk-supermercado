import { login, getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  // 1. O PORTEIRO: Verifica se já tem alguém logado
  const user = await getCurrentUser()

  // 2. A REGRA: Se já está logado, manda pra casa (Home)
  if (user) {
    redirect('/')
  }

  // Se não estiver logado, mostra o formulário normalmente
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Sistema de Chamados</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Faça login para continuar</p>
        
        {searchParams.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
            Usuário ou senha incorretos.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Usuário</label>
            <input 
              name="username" 
              type="text" 
              placeholder="ex: carlos.ti" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              name="password" 
              type="password" 
              placeholder="******" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Teste: carlos.ti / 123</p>
          <p>Teste: maria.caixa / 123</p>
        </div>
      </div>
    </div>
  )
}