"use client"

import Link from "next/link"
import { usePathname } from "next/navigation" // Import essencial

export function Navbar() {
  const pathname = usePathname()

  // --- A MÁGICA ACONTECE AQUI ---
  // Se a pessoa estiver na tela de login, a barra NÃO é renderizada.
  // Isso impede que você clique em links restritos antes de logar.
  if (pathname === "/login" || pathname === "/") {
    return null
  }
  // ------------------------------

  return (
    <nav className="bg-slate-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">HELPDESK</div>
        
        {/* Seus links de navegação */}
        <div className="flex gap-4">
            <Link href="/admin/chamados">Meus Chamados</Link>
            <Link href="/admin/usuarios">Cadastrar Usuários</Link>
            {/* Botão de Sair */}
        </div>
      </div>
    </nav>
  )
}