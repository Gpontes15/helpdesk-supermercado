import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../../lib/db"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // Agora o cérebro recebe a memória da conversa!
    const { historico, mensagem } = await request.json();

    // 1. Busca os chamados
    const chamados = await prisma.ticket.findMany({
      include: { store: true },
      orderBy: { createdAt: 'desc' },
      take: 50 
    });

    const usuarios = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, department: true, store: { select: { name: true } } }
    });

    // 2. Mapeia TUDO (incluindo descrição e a solução aplicada pela TI)
    const contextoChamados = chamados.map(t => 
      `[Chamado #${t.id}]
      Loja: ${t.store?.name || 'Sem Loja'}
      Status: ${t.status}
      Urgência: ${t.priority}
      Título: ${t.title}
      Descrição detalhada: ${t.description || 'Sem descrição'}
      Solução da TI: ${t.tiResponse || 'Ainda não há solução registrada'}
      -------------------`
    ).join('\n');

    const contextoUsuarios = usuarios.map(u => 
      `[Usuário] Nome: ${u.name} | Cargo: ${u.role} | Setor: ${u.department} | Loja: ${u.store?.name || 'Geral'}`
    ).join('\n');

    // 3. Formata a memória da conversa
    const historicoTexto = historico && historico.length > 0 
      ? historico.map((m: any) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`).join('\n')
      : "Nenhuma conversa anterior.";

    // 4. O Prompt Supremo
    const prompt = `
      Você é o Assistente Virtual Oficial do Helpdesk de TI do Supermercado Redenção.
      
      REGRAS DE FORMATAÇÃO E COMPORTAMENTO (OBRIGATÓRIO):
      1. Assuma que QUALQUER pergunta se refere ao ambiente do Helpdesk e da empresa.
      2. NUNCA use formatação Markdown. NÃO use asteriscos (**) para negrito. Escreva em texto 100% limpo. Se precisar destacar algo, use LETRAS MAIÚSCULAS. Se precisar fazer lista, use apenas hífens (-).
      3. Seja direto. Pareça um colega de TI conversando, não um robô corporativo.
      
      --- MEMÓRIA DA CONVERSA ---
      ${historicoTexto}
      
      --- DADOS COMPLETOS DO SISTEMA ---
      
      CHAMADOS RECENTES:
      ${contextoChamados || "Nenhum chamado registrado."}
      
      USUÁRIOS:
      ${contextoUsuarios || "Nenhum usuário registrado."}
      
      -------------------------------
      Nova Pergunta do usuário: "${mensagem}"
      Sua Resposta Direta (sem asteriscos):
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ resposta: result.response.text() });

  } catch (error) {
    console.error("Erro na IA:", error);
    return NextResponse.json({ error: "Erro ao processar a pergunta." }, { status: 500 });
  }
}