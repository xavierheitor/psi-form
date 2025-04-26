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

export async function getDashboardData() {
    console.log('[Server] getDashboardData - Iniciando busca de dados do dashboard');
    try {
        const [
            totalUsers,
            totalQuestions,
            totalAnswers,
            uniqueRespondents,
            recentAnswers,
            answerStats
        ] = await Promise.all([
            // Total de usuários
            prisma.user.count(),
            // Total de perguntas
            prisma.question.count({
                where: { deletedAt: null }
            }),
            // Total de respostas
            prisma.answer.count(),
            // Total de usuários únicos que responderam
            prisma.answer.groupBy({
                by: ['userId'],
                _count: {
                    userId: true
                }
            }),
            // Respostas recentes
            prisma.answer.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    answerOption: {
                        select: {
                            label: true
                        }
                    },
                    question: {
                        select: {
                            text: true
                        }
                    }
                },
                distinct: ['userId']
            }),
            // Estatísticas de respostas por opção
            prisma.answer.groupBy({
                by: ['answerOptionId'],
                _count: {
                    answerOptionId: true
                }
            })
        ]);

        // Buscar detalhes das opções de resposta
        const answerOptions = await prisma.answerOption.findMany({
            where: {
                id: {
                    in: answerStats.map(stat => stat.answerOptionId)
                }
            },
            select: {
                id: true,
                label: true,
                value: true
            }
        });

        const formattedSubmissions = recentAnswers.map(answer => ({
            id: `${answer.userId}-${answer.createdAt.toISOString()}`,
            user: answer.user.name,
            email: answer.user.email,
            date: answer.createdAt.toISOString().split('T')[0],
            time: answer.createdAt.toISOString().split('T')[1].split('.')[0],
            answers: [{
                question: answer.question.text,
                answer: answer.answerOption.label
            }]
        }));

        const formattedAnswerStats = answerStats.map(stat => {
            const option = answerOptions.find(opt => opt.id === stat.answerOptionId);
            return {
                optionId: stat.answerOptionId,
                label: option?.label || 'Desconhecido',
                value: option?.value || 'Desconhecido',
                count: stat._count.answerOptionId
            };
        });

        console.log('[Server] getDashboardData - Dados encontrados:', {
            totalUsers,
            totalQuestions,
            totalAnswers,
            uniqueRespondents: uniqueRespondents.length,
            recentSubmissionsCount: formattedSubmissions.length,
            answerStatsCount: formattedAnswerStats.length
        });

        return {
            success: true,
            data: {
                totalUsers,
                totalQuestions,
                totalAnswers,
                uniqueRespondents: uniqueRespondents.length,
                recentSubmissions: formattedSubmissions,
                answerStats: formattedAnswerStats
            }
        };
    } catch (error) {
        console.error('[Server] getDashboardData - Erro ao buscar dados:', error);
        return { success: false, error: 'Erro ao buscar dados do dashboard' };
    }
}

export async function getUsers() {
    console.log('[Server] getUsers - Iniciando busca de usuários');
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log('[Server] getUsers - Usuários encontrados:', users);
        return { success: true, users };
    } catch (error) {
        console.error('[Server] getUsers - Erro ao buscar usuários:', error);
        return { success: false, error: 'Erro ao buscar usuários' };
    }
}

export async function createUser(name: string, email: string, password: string, isAdmin: boolean) {
    console.log('[Server] createUser - Iniciando criação de usuário:', { name, email, isAdmin });
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: Em produção, a senha deve ser hashed
                isAdmin
            }
        });
        console.log('[Server] createUser - Usuário criado com sucesso:', user);
        revalidatePath('/admin/usuarios');
        return { success: true, user };
    } catch (error) {
        console.error('[Server] createUser - Erro ao criar usuário:', error);
        return { success: false, error: 'Erro ao criar usuário' };
    }
}

export async function updateUser(id: string, name: string, email: string, isAdmin: boolean) {
    console.log('[Server] updateUser - Iniciando atualização de usuário:', { id, name, email, isAdmin });
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                isAdmin
            }
        });
        console.log('[Server] updateUser - Usuário atualizado com sucesso:', user);
        revalidatePath('/admin/usuarios');
        return { success: true, user };
    } catch (error) {
        console.error('[Server] updateUser - Erro ao atualizar usuário:', error);
        return { success: false, error: 'Erro ao atualizar usuário' };
    }
}

export async function deleteUser(id: string) {
    console.log('[Server] deleteUser - Iniciando exclusão de usuário:', id);
    try {
        const user = await prisma.user.delete({
            where: { id }
        });
        console.log('[Server] deleteUser - Usuário excluído com sucesso:', user);
        revalidatePath('/admin/usuarios');
        return { success: true, user };
    } catch (error) {
        console.error('[Server] deleteUser - Erro ao excluir usuário:', error);
        return { success: false, error: 'Erro ao excluir usuário' };
    }
} 