import "./globals.css"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Helpdesk Supermercado",
  description: "Sistema de Chamados Interno",
}

// O ERRO ESTÁ AQUI: TEM QUE TER A PALAVRA "default"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-4">
          {children}
        </div>
      </body>
    </html>
  )
}