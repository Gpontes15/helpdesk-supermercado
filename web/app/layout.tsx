import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/Navbar" // <--- Importe a Navbar

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Helpdesk Supermercado",
  description: "Sistema de Chamados Interno",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar /> {/* <--- Coloque ela aqui, antes do children */}
        
        {/* Adicionei um padding-top (pt-4) para não colar na barra */}
        <div className="pt-4">
          {children}
        </div>
      </body>
    </html>
  )
}