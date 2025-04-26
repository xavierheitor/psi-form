'use client';

import { useState, useEffect } from 'react';
import { Table, Card, Space, Button, Modal, Descriptions, Tag, Typography, Statistic, List, Select } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { getDashboardData, getForms } from '@/lib/actions';

const { Title } = Typography;

interface Answer {
    question: string;
    answer: string;
}

interface Submission {
    id: string;
    user: string;
    email: string;
    date: string;
    time: string;
    answers: Answer[];
}

interface AnswerStat {
    optionId: string;
    label: string;
    value: string;
    count: number;
}

interface Form {
    id: string;
    title: string;
    description: string | null;
}

interface DashboardData {
    totalUsers: number;
    totalQuestions: number;
    totalAnswers: number;
    uniqueRespondents: number;
    recentSubmissions: Submission[];
    answerStats: AnswerStat[];
}

export default function RelatoriosPage() {
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedForm, setSelectedForm] = useState<string | null>(null);

    useEffect(() => {
        loadForms();
    }, []);

    useEffect(() => {
        if (selectedForm) {
            loadDashboardData(selectedForm);
        }
    }, [selectedForm]);

    const loadForms = async () => {
        setLoading(true);
        try {
            const result = await getForms();
            if (result.success && result.forms) {
                setForms(result.forms);
            }
        } catch (error) {
            console.error('Erro ao carregar formulários:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardData = async (formId: string) => {
        setLoading(true);
        try {
            const result = await getDashboardData(formId);
            if (result.success && result.data) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Usuário',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Data',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Hora',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Submission) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedSubmission(record);
                            setIsModalVisible(true);
                        }}
                    >
                        Ver Respostas
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <AdminAppLayout>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Select
                            style={{ width: 300 }}
                            placeholder="Selecione um formulário"
                            onChange={(value) => setSelectedForm(value)}
                            options={forms.map(form => ({
                                value: form.id,
                                label: form.title
                            }))}
                        />

                        {selectedForm && (
                            <Space size="large">
                                <Statistic
                                    title="Total de Usuários"
                                    value={dashboardData?.totalUsers || 0}
                                />
                                <Statistic
                                    title="Total de Perguntas"
                                    value={dashboardData?.totalQuestions || 0}
                                />
                                <Statistic
                                    title="Total de Respostas"
                                    value={dashboardData?.totalAnswers || 0}
                                />
                                <Statistic
                                    title="Respondentes Únicos"
                                    value={dashboardData?.uniqueRespondents || 0}
                                />
                            </Space>
                        )}
                    </Space>
                </Card>

                {selectedForm && dashboardData && (
                    <>
                        <Card>
                            <Title level={4}>Estatísticas de Respostas</Title>
                            <Table
                                dataSource={dashboardData.answerStats}
                                rowKey="optionId"
                                loading={loading}
                                columns={[
                                    {
                                        title: 'Opção',
                                        dataIndex: 'label',
                                        key: 'label',
                                    },
                                    {
                                        title: 'Valor',
                                        dataIndex: 'value',
                                        key: 'value',
                                    },
                                    {
                                        title: 'Quantidade',
                                        dataIndex: 'count',
                                        key: 'count',
                                    },
                                ]}
                            />
                        </Card>

                        <Card>
                            <Title level={4}>Últimos Respondentes</Title>
                            <Table
                                columns={columns}
                                dataSource={dashboardData.recentSubmissions}
                                rowKey="id"
                                loading={loading}
                            />
                        </Card>
                    </>
                )}

                <Modal
                    title="Detalhes do Respondente"
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setSelectedSubmission(null);
                    }}
                    footer={null}
                    width={800}
                >
                    {selectedSubmission && (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Descriptions bordered>
                                <Descriptions.Item label="Usuário" span={3}>
                                    {selectedSubmission.user}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email" span={3}>
                                    {selectedSubmission.email}
                                </Descriptions.Item>
                                <Descriptions.Item label="Data" span={3}>
                                    {selectedSubmission.date}
                                </Descriptions.Item>
                                <Descriptions.Item label="Hora" span={3}>
                                    {selectedSubmission.time}
                                </Descriptions.Item>
                            </Descriptions>

                            <Card>
                                <Title level={5}>Respostas</Title>
                                <List
                                    dataSource={selectedSubmission.answers}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Space direction="vertical">
                                                <Typography.Text strong>
                                                    {item.question}
                                                </Typography.Text>
                                                <Typography.Text>
                                                    {item.answer}
                                                </Typography.Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Space>
                    )}
                </Modal>
            </Space>
        </AdminAppLayout>
    );
} 