'use client';

import { useState, useEffect } from 'react';
import { Table, Card, Space, Button, Modal, Descriptions, Tag, Typography, Statistic, List } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { getDashboardData } from '@/lib/actions';

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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getDashboardData();
            if (result.success && result.data) {
                setDashboardData(result.data);
            } else {
                console.error('Erro ao carregar dados:', result.error);
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
                </Card>

                <Card>
                    <Title level={4}>Estatísticas de Respostas</Title>
                    <Table
                        dataSource={dashboardData?.answerStats}
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
                        dataSource={dashboardData?.recentSubmissions}
                        rowKey="id"
                        loading={loading}
                    />
                </Card>

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