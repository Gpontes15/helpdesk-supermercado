import { login } from "@/actions/auth-actions"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sistema de Chamados
          <span className="block text-sm font-normal text-gray-500 mt-1">Faça login para continuar</span>
        </h1>
        
        <form action={login} className="space-y-4">
          <div>
            {/* MUDANÇA AQUI: Label agora é Usuário */}
            <label className="block text-sm font-bold text-gray-700">Usuário</label>
            
            <input 
              name="username" // <--- Importante: name="username" para o backend ler
              type="text"     // <--- Importante: type="text" para não pedir @
              required 
              className="w-full border p-2 rounded text-black mt-1" 
              placeholder="ex: carlos.ti" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Senha</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full border p-2 rounded text-black mt-1" 
              placeholder="******" 
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
            Entrar
          </button>
        </form>
        
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Teste: carlos.ti / 123</p>
          <p>Teste: maria.caixa / 123</p>
        </div>
      </div>
    </div>
  )
}