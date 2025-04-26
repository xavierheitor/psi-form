'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

// Inicializa o Prisma Client uma única vez
const prisma = new PrismaClient();

export async function createQuestion(text: string) {
    try {
        const question = await prisma.question.create({
            data: {
                text,
            },
        });
        revalidatePath('/admin/forms');
        return { success: true, question };
    } catch (error) {
        console.error('[Server] createQuestion - Erro ao criar pergunta:', error);
        return { error: 'Erro ao criar pergunta' };
    }
}

export async function createBatchQuestions(questions: string[]) {
    try {
        const createdQuestions = await Promise.all(
            questions.map(text =>
                prisma.question.create({
                    data: { text }
                })
            )
        );
        revalidatePath('/admin/forms');
        return { success: true, questions: createdQuestions };
    } catch (error) {
        console.error('[Server] createBatchQuestions - Erro ao criar perguntas em lote:', error);
        return { error: 'Erro ao criar perguntas em lote' };
    }
}

export async function updateQuestion(id: string, text: string) {
    try {
        const question = await prisma.question.update({
            where: { id },
            data: { text },
        });
        revalidatePath('/admin/forms');
        return { success: true, question };
    } catch (error) {
        console.error('[Server] updateQuestion - Erro ao atualizar pergunta:', error);
        return { error: 'Erro ao atualizar pergunta' };
    }
}

export async function deleteQuestion(id: string) {
    try {
        const question = await prisma.question.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        revalidatePath('/admin/forms');
        return { success: true, question };
    } catch (error) {
        console.error('[Server] deleteQuestion - Erro ao excluir pergunta:', error);
        return { error: 'Erro ao excluir pergunta' };
    }
}

export async function createAnswerOption(value: string, label: string) {
    console.log('[Server] createAnswerOption - Iniciando criação de opção de resposta:', { value, label });
    try {
        const answerOption = await prisma.answerOption.create({
            data: {
                value,
                label,
            },
        });
        console.log('[Server] createAnswerOption - Opção criada com sucesso:', answerOption);
        revalidatePath('/admin/respostas');
        return { success: true, answerOption };
    } catch (error) {
        console.error('[Server] createAnswerOption - Erro ao criar opção de resposta:', error);
        return { success: false, error: 'Erro ao criar opção de resposta' };
    }
}

export async function updateAnswerOption(id: string, value: string, label: string) {
    console.log('[Server] updateAnswerOption - Iniciando atualização de opção:', { id, value, label });
    try {
        const answerOption = await prisma.answerOption.update({
            where: { id },
            data: {
                value,
                label,
            },
        });
        console.log('[Server] updateAnswerOption - Opção atualizada com sucesso:', answerOption);
        revalidatePath('/admin/respostas');
        return { success: true, answerOption };
    } catch (error) {
        console.error('[Server] updateAnswerOption - Erro ao atualizar opção:', error);
        return { success: false, error: 'Erro ao atualizar opção de resposta' };
    }
}

export async function deleteAnswerOption(id: string) {
    console.log('[Server] deleteAnswerOption - Iniciando exclusão de opção:', id);
    try {
        const answerOption = await prisma.answerOption.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        console.log('[Server] deleteAnswerOption - Opção excluída com sucesso:', answerOption);
        revalidatePath('/admin/respostas');
        return { success: true, answerOption };
    } catch (error) {
        console.error('[Server] deleteAnswerOption - Erro ao excluir opção:', error);
        return { success: false, error: 'Erro ao excluir opção de resposta' };
    }
}

export async function submitAnswer(questionId: string, answerOptionId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { error: 'Usuário não autenticado' };
        }

        const answer = await prisma.answer.create({
            data: {
                questionId,
                answerOptionId,
                userId: user.id,
            },
        });
        revalidatePath('/form');
        return { success: true, answer };
    } catch (error) {
        console.error('[Server] submitAnswer - Erro ao enviar resposta:', error);
        return { error: 'Erro ao enviar resposta' };
    }
}

export async function getQuestions() {
    console.log('[Server] getQuestions - Iniciando busca de perguntas e opções de resposta');
    try {
        // Busca todas as opções de resposta disponíveis
        const answerOptionsResult = await prisma.answerOption.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                value: true,
                label: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Busca todas as perguntas
        const questions = await prisma.question.findMany({
            where: {
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Combina as perguntas com todas as opções de resposta
        const questionsWithOptions = questions.map(question => ({
            ...question,
            answerOptions: answerOptionsResult
        }));

        console.log('[Server] getQuestions - Dados encontrados:', {
            questionsCount: questions.length,
            answerOptionsCount: answerOptionsResult.length,
            firstQuestion: questionsWithOptions[0]
        });

        return { success: true, questions: questionsWithOptions };
    } catch (error) {
        console.error('[Server] getQuestions - Erro ao buscar dados:', error);
        return { success: false, error: 'Erro ao buscar perguntas e opções de resposta' };
    }
}

export async function getAnswerOptions() {
    console.log('[Server] getAnswerOptions - Iniciando busca de opções de resposta');
    try {
        const answerOptions = await prisma.answerOption.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log('[Server] getAnswerOptions - Opções encontradas:', answerOptions);
        return { success: true, answerOptions };
    } catch (error) {
        console.error('[Server] getAnswerOptions - Erro ao buscar opções de resposta:', error);
        return { success: false, error: 'Erro ao buscar opções de resposta' };
    }
} 