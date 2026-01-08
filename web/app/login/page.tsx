import { login } from "@/actions/auth-actions"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Chamados</h1>
          <p className="text-gray-500 text-sm">Faça login para continuar</p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="Ex: caixa@mercado.com"
              required 
              className="mt-1 block w-full border border-gray-300 p-2 rounded text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              name="password" 
              type="password" 
              placeholder="***"
              required 
              className="mt-1 block w-full border border-gray-300 p-2 rounded text-black"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-xs text-center text-gray-400">
          <p>Teste: caixa@mercado.com / 123</p>
          <p>Teste: acougue@mercado.com / 123</p>
          <p>Teste: ti@mercado.com / 123</p>
        </div>
      </div>
    </div>
  )
}