'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

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

export async function submitAnswer(formId: string, questionId: string, answerOptionId: string) {
    console.log('[Server] submitAnswer - Iniciando envio de resposta:', { formId, questionId, answerOptionId });
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        const formQuestion = await prisma.formQuestion.findFirst({
            where: {
                formId,
                questionId,
                deletedAt: null
            }
        });

        if (!formQuestion) {
            return { success: false, error: 'Pergunta não encontrada no formulário' };
        }

        const answer = await prisma.answer.create({
            data: {
                userId: user.id,
                formId,
                questionId,
                answerOptionId,
                formQuestionId: formQuestion.id
            }
        });

        console.log('[Server] submitAnswer - Resposta enviada com sucesso:', answer);
        revalidatePath('/forms');
        return { success: true, answer };
    } catch (error) {
        console.error('[Server] submitAnswer - Erro ao enviar resposta:', error);
        return { success: false, error: 'Erro ao enviar resposta' };
    }
}

interface RawQuestion {
    id: string;
    text: string;
    type: string;
    answerOptionId: string;
    value: string;
    label: string;
    formTitle: string;
}

interface FormattedQuestion {
    id: string;
    text: string;
    answerOptions: {
        id: string;
        value: string;
        label: string;
    }[];
    form: {
        title: string;
    };
}

export async function getQuestions(formId: string) {
    console.log('[Server] getQuestions - Iniciando busca de perguntas:', { formId });
    try {
        // Primeiro, vamos verificar se existem FormQuestions para este formId
        const formQuestionsCount = await prisma.formQuestion.count({
            where: {
                formId,
                deletedAt: null
            }
        });
        console.log('[Server] getQuestions - Total de FormQuestions encontradas:', formQuestionsCount);

        const formQuestions = await prisma.formQuestion.findMany({
            where: {
                formId,
                deletedAt: null
            },
            include: {
                question: {
                    include: {
                        answerOptions: {
                            where: {
                                deletedAt: null
                            }
                        }
                    }
                },
                form: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        });

        console.log('[Server] getQuestions - Dados brutos retornados:', JSON.stringify(formQuestions, null, 2));

        const formattedQuestions = formQuestions.map(fq => ({
            id: fq.question.id,
            text: fq.question.text,
            answerOptions: fq.question.answerOptions.map(ao => ({
                id: ao.id,
                value: ao.value,
                label: ao.label
            })),
            form: {
                title: fq.form.title
            }
        }));

        console.log('[Server] getQuestions - Perguntas formatadas:', JSON.stringify(formattedQuestions, null, 2));
        return { success: true, questions: formattedQuestions };
    } catch (error) {
        console.error('[Server] getQuestions - Erro ao buscar perguntas:', error);
        return { success: false, error: 'Erro ao buscar perguntas' };
    }
}

export async function getAllQuestions() {
    console.log('[Server] getAllQuestions - Iniciando busca de todas as perguntas');
    try {
        const questions = await prisma.question.findMany({
            where: {
                deletedAt: null
            },
            include: {
                answerOptions: {
                    where: {
                        deletedAt: null
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('[Server] getAllQuestions - Perguntas encontradas:', JSON.stringify(questions, null, 2));
        return { success: true, questions };
    } catch (error) {
        console.error('[Server] getAllQuestions - Erro ao buscar perguntas:', error);
        return { success: false, error: 'Erro ao buscar perguntas' };
    }
}

export async function getAnswerOptions() {
    console.log('[Server] getAnswerOptions - Iniciando busca de opções de resposta');
    try {
        const answerOptions = await prisma.answerOption.findMany({
            where: {
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('[Server] getAnswerOptions - Opções encontradas:', answerOptions);
        return { success: true, answerOptions };
    } catch (error) {
        console.error('[Server] getAnswerOptions - Erro ao buscar opções:', error);
        return { success: false, error: 'Erro ao buscar opções de resposta' };
    }
}

export async function getDashboardData(formId?: string) {
    console.log('[Server] getDashboardData - Iniciando busca de dados do dashboard:', { formId });
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
            prisma.answer.count({
                where: formId ? { formId } : undefined
            }),
            // Total de usuários únicos que responderam
            prisma.answer.groupBy({
                by: ['userId'],
                where: formId ? { formId } : undefined,
                _count: {
                    userId: true
                }
            }),
            // Respostas recentes
            prisma.answer.findMany({
                take: 5,
                where: formId ? { formId } : undefined,
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
                where: formId ? { formId } : undefined,
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

export async function createForm(title: string, description: string | null, isActive: boolean) {
    console.log('[Server] createForm - Iniciando criação de formulário:', { title, description, isActive });
    try {
        const form = await prisma.form.create({
            data: {
                title,
                description,
                isActive
            }
        });
        console.log('[Server] createForm - Formulário criado com sucesso:', form);
        revalidatePath('/admin/forms');
        return { success: true, form };
    } catch (error) {
        console.error('[Server] createForm - Erro ao criar formulário:', error);
        return { success: false, error: 'Erro ao criar formulário' };
    }
}

export async function getForms() {
    console.log('[Server] getForms - Iniciando busca de formulários');
    try {
        const forms = await prisma.form.findMany({
            where: {
                deletedAt: null
            },
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                answerOptions: {
                                    where: {
                                        deletedAt: null
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('[Server] getForms - Formulários encontrados:', forms);
        return { success: true, forms };
    } catch (error) {
        console.error('[Server] getForms - Erro ao buscar formulários:', error);
        return { success: false, error: 'Erro ao buscar formulários' };
    }
}

export async function updateForm(id: string, title: string, description: string | null, isActive: boolean) {
    console.log('[Server] updateForm - Iniciando atualização de formulário:', { id, title, description, isActive });
    try {
        const form = await prisma.form.update({
            where: { id },
            data: {
                title,
                description,
                isActive
            }
        });
        console.log('[Server] updateForm - Formulário atualizado com sucesso:', form);
        revalidatePath('/admin/forms');
        return { success: true, form };
    } catch (error) {
        console.error('[Server] updateForm - Erro ao atualizar formulário:', error);
        return { success: false, error: 'Erro ao atualizar formulário' };
    }
}

export async function deleteForm(id: string) {
    console.log('[Server] deleteForm - Iniciando exclusão de formulário:', id);
    try {
        const form = await prisma.form.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });
        console.log('[Server] deleteForm - Formulário excluído com sucesso:', form);
        revalidatePath('/admin/forms');
        return { success: true, form };
    } catch (error) {
        console.error('[Server] deleteForm - Erro ao excluir formulário:', error);
        return { success: false, error: 'Erro ao excluir formulário' };
    }
}

export async function addQuestionToForm(formId: string, questionId: string, order: number) {
    console.log('[Server] addQuestionToForm - Iniciando adição de pergunta ao formulário:', { formId, questionId, order });
    try {
        const formQuestion = await prisma.formQuestion.create({
            data: {
                formId,
                questionId,
                order
            }
        });
        console.log('[Server] addQuestionToForm - Pergunta adicionada com sucesso:', formQuestion);
        revalidatePath('/admin/forms');
        return { success: true, formQuestion };
    } catch (error) {
        console.error('[Server] addQuestionToForm - Erro ao adicionar pergunta:', error);
        return { success: false, error: 'Erro ao adicionar pergunta ao formulário' };
    }
}

export async function removeQuestionFromForm(formId: string, questionId: string) {
    console.log('[Server] removeQuestionFromForm - Iniciando remoção de pergunta do formulário:', { formId, questionId });
    try {
        const formQuestion = await prisma.formQuestion.delete({
            where: {
                formId_questionId: {
                    formId,
                    questionId
                }
            }
        });
        console.log('[Server] removeQuestionFromForm - Pergunta removida com sucesso:', formQuestion);
        revalidatePath('/admin/forms');
        return { success: true, formQuestion };
    } catch (error) {
        console.error('[Server] removeQuestionFromForm - Erro ao remover pergunta:', error);
        return { success: false, error: 'Erro ao remover pergunta do formulário' };
    }
}

export async function addAnswerOptionToQuestion(questionId: string, answerOptionId: string) {
    console.log('[Server] addAnswerOptionToQuestion - Iniciando vinculação de opção de resposta:', { questionId, answerOptionId });
    try {
        const question = await prisma.question.update({
            where: { id: questionId },
            data: {
                answerOptions: {
                    connect: {
                        id: answerOptionId
                    }
                }
            }
        });
        console.log('[Server] addAnswerOptionToQuestion - Opção vinculada com sucesso:', question);
        revalidatePath('/admin/forms');
        return { success: true, question };
    } catch (error) {
        console.error('[Server] addAnswerOptionToQuestion - Erro ao vincular opção:', error);
        return { success: false, error: 'Erro ao vincular opção de resposta à pergunta' };
    }
}

export async function getFormAnswers(formId: string) {
    console.log('[Server] getFormAnswers - Iniciando busca de respostas:', { formId });
    try {
        const answers = await prisma.answer.findMany({
            where: {
                formId,
                deletedAt: null
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                question: {
                    select: {
                        text: true
                    }
                },
                answerOption: {
                    select: {
                        label: true,
                        value: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('[Server] getFormAnswers - Respostas encontradas:', answers);
        return { success: true, answers };
    } catch (error) {
        console.error('[Server] getFormAnswers - Erro ao buscar respostas:', error);
        return { success: false, error: 'Erro ao buscar respostas' };
    }
} 