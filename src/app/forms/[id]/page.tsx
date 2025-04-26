'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Form, Input, Select, Button, message, Spin, Typography } from 'antd';
import { UserOutlined, FormOutlined } from '@ant-design/icons';
import { getQuestions, submitAnswer } from '@/lib/actions';

const { Title, Text } = Typography;

interface Question {
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

export default function FormPage() {
    const [form] = Form.useForm();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [formTitle, setFormTitle] = useState('');

    useEffect(() => {
        loadQuestions();
    }, [params.id]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await getQuestions(params.id as string);
            if (response.success && response.questions) {
                setQuestions(response.questions);
                setFormTitle(response.questions[0]?.form?.title || 'Formulário');
            } else {
                message.error('Erro ao carregar perguntas');
            }
        } catch (error) {
            console.error('Erro ao carregar perguntas:', error);
            message.error('Erro ao carregar perguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: Record<string, string>) => {
        try {
            setSubmitting(true);
            const answers = Object.entries(values).map(([questionId, answerOptionId]) => ({
                questionId,
                answerOptionId,
            }));

            const results = await Promise.all(
                answers.map(({ questionId, answerOptionId }) =>
                    submitAnswer(params.id as string, questionId, answerOptionId)
                )
            );

            const hasError = results.some(result => !result.success);
            if (hasError) {
                message.error('Erro ao enviar algumas respostas');
            } else {
                message.success('Respostas enviadas com sucesso!');
                form.resetFields();
            }
        } catch (error) {
            console.error('Erro ao enviar respostas:', error);
            message.error('Erro ao enviar respostas');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Title level={2}>
                        <FormOutlined /> {formTitle}
                    </Title>
                    <Text type="secondary">
                        <UserOutlined /> Preencha todas as perguntas abaixo
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {questions.map((question) => (
                        <Form.Item
                            key={question.id}
                            name={question.id}
                            label={question.text}
                            rules={[{ required: true, message: 'Por favor, responda esta pergunta' }]}
                        >
                            <Select
                                placeholder="Selecione uma opção"
                                options={question.answerOptions.map(option => ({
                                    value: option.id,
                                    label: option.label
                                }))}
                            />
                        </Form.Item>
                    ))}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            size="large"
                            block
                        >
                            Enviar Respostas
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
} 