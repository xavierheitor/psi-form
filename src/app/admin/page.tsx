'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin, message } from 'antd';
import { UserOutlined, FormOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { getDashboardData } from '@/lib/actions';

const { Title } = Typography;

interface DashboardData {
    totalUsers: number;
    totalQuestions: number;
    totalAnswers: number;
    uniqueRespondents: number;
    recentSubmissions: Array<{
        id: string;
        user: string;
        email: string;
        date: string;
        time: string;
    }>;
}

const columns = [
    {
        title: 'Usuário',
        dataIndex: 'user',
        key: 'user',
        render: (text: string, record: any) => (
            <div>
                <div>{text}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
            </div>
        ),
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
];

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await getDashboardData();
                if (result.success && result.data) {
                    setDashboardData(result.data);
                } else {
                    message.error('Erro ao carregar dados do dashboard');
                }
            } catch (error) {
                message.error('Erro ao carregar dados do dashboard');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <AdminAppLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spin size="large" />
                </div>
            </AdminAppLayout>
        );
    }

    return (
        <AdminAppLayout>
            <Row gutter={[24, 24]} style={{ padding: '24px' }}>
                <Col span={24}>
                    <Title level={2}>Dashboard Administrativo</Title>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total de Usuários"
                            value={dashboardData?.totalUsers || 0}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total de Perguntas"
                            value={dashboardData?.totalQuestions || 0}
                            prefix={<FormOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total de Respostas"
                            value={dashboardData?.totalAnswers || 0}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Usuários que Responderam"
                            value={dashboardData?.uniqueRespondents || 0}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Respostas Recentes">
                        <Table
                            dataSource={dashboardData?.recentSubmissions || []}
                            columns={columns}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </AdminAppLayout>
    );
} 