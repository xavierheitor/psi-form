'use client';

import { useEffect, useState } from 'react';
import { Form, Radio, Button, Card, message, Typography, Avatar, Row, Col, Space, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AppLayout from '@/components/AppLayout';
import { getQuestions, getAnswerOptions, submitAnswer } from '@/lib/actions';
import { getCurrentUser } from '@/lib/auth';
import { useParams } from 'next/navigation';

const { Title, Text } = Typography;

interface Question {
    id: string;
    text: string;
    answerOptions: AnswerOption[];
    form: {
        title: string;
    };
}

interface AnswerOption {
    id: string;
    value: string;
    label: string;
}

export default function FormResponsePage() {
    const [form] = Form.useForm();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const params = useParams();
    const formId = params.formId as string;

    useEffect(() => {
        const loadData = async () => {
            try {
                const [questionsResult, currentUser] = await Promise.all([
                    getQuestions(formId),
                    getCurrentUser()
                ]);

                if (questionsResult.success && questionsResult.questions) {
                    setQuestions(questionsResult.questions);
                    setFormTitle(questionsResult.questions[0]?.form?.title || 'Formulário');
                }

                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                message.error('Erro ao carregar dados');
            }
        };

        loadData();
    }, [formId]);

    const onFinish = async (values: Record<string, string>) => {
        setLoading(true);
        try {
            const answers = Object.entries(values).map(([questionId, answerOptionId]) => ({
                questionId,
                answerOptionId,
            }));

            const results = await Promise.all(
                answers.map(({ questionId, answerOptionId }) =>
                    submitAnswer(formId, questionId, answerOptionId)
                )
            );

            const hasError = results.some(result => result.error);
            if (hasError) {
                message.error('Erro ao enviar algumas respostas');
            } else {
                message.success('Formulário enviado com sucesso!');
                form.resetFields();
            }
        } catch (error) {
            message.error('Erro ao enviar formulário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Row justify="center">
                <Col xs={24} sm={20} md={16} lg={12}>
                    <Card>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Flex
                                align="center"
                                gap="middle"
                                style={{
                                    padding: '16px',
                                    background: '#f0f2f5',
                                    borderRadius: '8px'
                                }}
                            >
                                <Avatar
                                    size={64}
                                    icon={<UserOutlined />}
                                />
                                <Space direction="vertical" size="small">
                                    <Title level={4} style={{ margin: 0 }}>{formTitle}</Title>
                                    <Text type="secondary">Respondido por: {user?.name || 'Usuário'}</Text>
                                    <Text type="secondary">{user?.email || ''}</Text>
                                </Space>
                            </Flex>

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                            >
                                {questions.map((question) => (
                                    <Form.Item
                                        key={question.id}
                                        name={question.id}
                                        label={question.text}
                                        rules={[{ required: true, message: 'Por favor, selecione uma opção!' }]}
                                    >
                                        <Radio.Group>
                                            {question.answerOptions.map((option) => (
                                                <Radio key={option.id} value={option.id}>
                                                    {option.label}
                                                </Radio>
                                            ))}
                                        </Radio.Group>
                                    </Form.Item>
                                ))}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{ width: '100%' }}
                                        loading={loading}
                                    >
                                        Enviar Respostas
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </AppLayout>
    );
} 