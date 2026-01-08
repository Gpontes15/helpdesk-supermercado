'use client'

import { useState } from "react"
import { createTicket } from "@/actions/ticket-actions"

// Definimos o tipo de dado que esperamos receber (Loja)
type Store = {
  id: string
  name: string
}

const slaInfo = {
  LOW: "Até 48 horas (Dúvidas simples)",
  MEDIUM: "Até 24 horas (Computador lento)",
  HIGH: "Até 8 horas (Impressora parada)",
  CRITICAL: "Até 2 horas (Loja parada/Sem venda)",
}

export function TicketForm({ stores }: { stores: Store[] }) {
  const [priority, setPriority] = useState("LOW")

  return (
    <form action={createTicket} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input name="title" required className="mt-1 block w-full border border-gray-300 p-2 rounded text-black" placeholder="Ex: Erro no Caixa" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Loja</label>
        <select name="storeId" className="mt-1 block w-full border border-gray-300 p-2 rounded text-black">
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <label className="block text-sm font-medium text-gray-700">Qual a Urgência?</label>
        <select 
          name="priority" 
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1 block w-full border border-gray-300 p-2 rounded text-black bg-white"
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        
        <p className="text-sm text-blue-800 mt-2 font-medium">
          ⏱ Previsão de atendimento: <br/>
          <span className="font-bold">{slaInfo[priority as keyof typeof slaInfo]}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea name="description" required className="mt-1 block w-full border border-gray-300 p-2 rounded text-black" rows={3}></textarea>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
        Salvar Chamado
      </button>
    </form>
  )
}