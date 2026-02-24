'use client'
import { useState } from 'react'

export function ExcluirProduto({ id, nome, onSucesso }: { id: number, nome: string, onSucesso: () => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleExcluir() {
    if (!confirm(`Tem certeza que deseja apagar o produto "${nome}"?\n\nIsso apagará também todo o histórico de movimentações dele.`)) {
        return;
    }

    setDeleting(true)
    try {
        const res = await fetch(`http://10.200.103.12:8080/produtos/${id}`, { method: 'DELETE' })
        
        if (res.ok) {
            onSucesso() // Sucesso! Atualiza a lista
        } else {
            // Se der erro (ex: Banco travou), mostramos o motivo
            alert("Não foi possível excluir. Verifique se o servidor Java está rodando.")
        }
    } catch (e) {
        alert("Erro de conexão com o Java.")
    } finally {
        setDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleExcluir}
      disabled={deleting}
      className={`p-1 transition-colors ${deleting ? 'text-gray-200 cursor-wait' : 'text-gray-300 hover:text-red-500'}`}
      title="Excluir Produto"
    >
      {deleting ? '⏳' : '🗑️'}
    </button>
  )
}