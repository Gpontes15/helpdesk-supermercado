'use server'

import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || user.password !== password) {
    redirect('/login?error=invalid') 
  }

  const cookieStore = await cookies()
  
  // CORREÇÃO AQUI:
  // Mudamos 'secure' para false. Isso obriga o navegador a aceitar o cookie
  // mesmo que você esteja acessando pelo IP (HTTP) no servidor.
  cookieStore.set('session_user_id', user.id, {
    httpOnly: true,
    secure: false, // <--- MUDANÇA CRUCIAL: Deixe false para rodar no IP interno
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/'
  })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session_user_id')
  redirect('/login')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('session_user_id')?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { store: true }
  })

  return user
}