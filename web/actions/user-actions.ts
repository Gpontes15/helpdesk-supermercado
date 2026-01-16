'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth-actions"

// 1. CADASTRAR USUÁRIO
export async function registerUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') {
    throw new Error("Acesso negado")
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string 
  const department = formData.get('department') as string
  const role = formData.get('role') as 'USER' | 'ADMIN'
  
  // --- NOVO: Pegando o ID da loja ---
  const storeId = formData.get('storeId') as string 

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    redirect('/admin/usuarios?error=email_exists')
  }

  await prisma.user.create({
    data: { 
        name, 
        email, 
        password, 
        department, 
        role,
        // Se storeId vier vazio (null ou ""), não salva, senão salva o ID
        storeId: storeId || null 
    }
  })

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios?success=created')
}

// 2. ATUALIZAR USUÁRIO
export async function updateUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') return

  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string 
  const department = formData.get('department') as string
  const role = formData.get('role') as 'USER' | 'ADMIN'
  
  // --- NOVO: Pegando o ID da loja ---
  const storeId = formData.get('storeId') as string

  // Prepara os dados para atualizar
  const dataToUpdate: any = {
    name,
    email,
    department,
    role,
    storeId: storeId || null // Atualiza a loja também
  }

  // Só atualiza a senha se o usuário digitou algo novo
  if (password && password.trim() !== "") {
    dataToUpdate.password = password
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    })
  } catch (error) {
    console.error(error)
    redirect('/admin/usuarios?error=update_failed')
  }

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios?success=updated')
}

// 3. DELETAR USUÁRIO
export async function deleteUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (currentUser?.role !== 'ADMIN') return

  const userIdToDelete = formData.get('userId') as string

  if (userIdToDelete === currentUser.id) {
    redirect('/admin/usuarios?error=self_delete')
  }

  try {
    await prisma.user.delete({
      where: { id: userIdToDelete }
    })
  } catch (error) {
    redirect('/admin/usuarios?error=has_history')
  }

  revalidatePath('/admin/usuarios')
}