'use server'

import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user || user.password !== password) {
    redirect('/login?error=invalid') 
  }

  const cookieStore = await cookies()
  
  // Cookie V2 para garantir que versões antigas não conflitem
  cookieStore.set('session_user_id_v2', user.id, {
    httpOnly: true,
    secure: false, 
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/'
  })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session_user_id_v2')
  redirect('/login')
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('session_user_id_v2')?.value

    if (!userId) return null

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    })

    // Se o cookie existe mas o usuário não foi encontrado (ex: banco resetado)
    // Retorna null para forçar um novo login em vez de quebrar a página
    if (!user) return null

    return user

  } catch (error) {
    // Proteção contra falhas gerais (banco offline, erro de conexão, etc)
    console.error("Erro ao verificar sessão do usuário:", error)
    return null
  }
}