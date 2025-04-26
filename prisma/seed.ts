import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Criar usuários
    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'João Silva',
                email: 'joao.silva@empresa.com',
                password: await hash('123456', 10),
                isAdmin: false,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Maria Santos',
                email: 'maria.santos@empresa.com',
                password: await hash('123456', 10),
                isAdmin: false,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Pedro Oliveira',
                email: 'pedro.oliveira@empresa.com',
                password: await hash('123456', 10),
                isAdmin: false,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Ana Costa',
                email: 'ana.costa@empresa.com',
                password: await hash('123456', 10),
                isAdmin: true,
            },
        }),
    ]);

    // Criar opções de resposta padrão para escalas Likert
    const answerOptions = await Promise.all([
        prisma.answerOption.create({
            data: {
                value: '1',
                label: 'Discordo Totalmente',
            },
        }),
        prisma.answerOption.create({
            data: {
                value: '2',
                label: 'Discordo Parcialmente',
            },
        }),
        prisma.answerOption.create({
            data: {
                value: '3',
                label: 'Neutro',
            },
        }),
        prisma.answerOption.create({
            data: {
                value: '4',
                label: 'Concordo Parcialmente',
            },
        }),
        prisma.answerOption.create({
            data: {
                value: '5',
                label: 'Concordo Totalmente',
            },
        }),
    ]);

    // Criar perguntas para avaliação psicológica
    const psychologicalQuestions = await Promise.all([
        prisma.question.create({
            data: {
                text: 'Sinto-me confortável ao expressar minhas emoções no ambiente de trabalho',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Consigo lidar bem com situações de pressão e estresse',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Mantenho um equilíbrio saudável entre vida pessoal e profissional',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Sinto-me motivado(a) para realizar minhas tarefas diárias',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Consigo trabalhar bem em equipe',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
    ]);

    // Criar perguntas para avaliação psicossocial
    const psychosocialQuestions = await Promise.all([
        prisma.question.create({
            data: {
                text: 'O ambiente de trabalho é seguro e adequado',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Existe um bom relacionamento entre colegas de trabalho',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Recebo feedback adequado sobre meu desempenho',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'As demandas de trabalho são razoáveis',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
        prisma.question.create({
            data: {
                text: 'Existe respeito e valorização da diversidade no ambiente de trabalho',
                answerOptions: {
                    connect: answerOptions.map(option => ({ id: option.id })),
                },
            },
        }),
    ]);

    // Criar formulários
    const forms = await Promise.all([
        prisma.form.create({
            data: {
                title: 'Avaliação Psicológica',
                description: 'Avaliação do bem-estar psicológico e emocional do colaborador',
                isActive: true,
                questions: {
                    create: psychologicalQuestions.map((question, index) => ({
                        questionId: question.id,
                        order: index + 1,
                    })),
                },
            },
        }),
        prisma.form.create({
            data: {
                title: 'Avaliação Psicossocial',
                description: 'Avaliação das condições psicossociais do ambiente de trabalho',
                isActive: true,
                questions: {
                    create: psychosocialQuestions.map((question, index) => ({
                        questionId: question.id,
                        order: index + 1,
                    })),
                },
            },
        }),
    ]);

    // Criar algumas respostas de exemplo
    const answers = await Promise.all([
        // Respostas do João Silva para Avaliação Psicológica
        ...psychologicalQuestions.map((question, index) =>
            prisma.answer.create({
                data: {
                    userId: users[0].id,
                    formId: forms[0].id,
                    questionId: question.id,
                    answerOptionId: answerOptions[Math.floor(Math.random() * 5)].id,
                },
            })
        ),
        // Respostas da Maria Santos para Avaliação Psicossocial
        ...psychosocialQuestions.map((question, index) =>
            prisma.answer.create({
                data: {
                    userId: users[1].id,
                    formId: forms[1].id,
                    questionId: question.id,
                    answerOptionId: answerOptions[Math.floor(Math.random() * 5)].id,
                },
            })
        ),
    ]);

    console.log('Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 