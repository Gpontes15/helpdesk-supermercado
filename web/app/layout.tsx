"use client" // <--- Importante: Tem que ser Client Component para ler a rota

import Link from "next/link"
import { usePathname } from "next/navigation" // <--- Importe isso

export function Navbar() {
  const pathname = usePathname() // <--- Pega a rota atual

  // Se a rota for exatamente "/login" (ou a rota raiz "/" se for seu login), não mostra nada
  // Ajuste "/login" conforme a URL exata que aparece no seu navegador
  if (pathname === "/login" || pathname === "/") {
    return null
  }

  return (
    <nav className="bg-slate-900 text-white p-4">
      {/* ... todo o resto do seu código da Navbar ... */}
      <div className="container mx-auto flex justify-between items-center">
         <h1>HELPDESK</h1>
         {/* ... menus ... */}
      </div>
    </nav>
  )
}