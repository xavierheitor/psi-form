'use client';

import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import { UserOutlined, FormOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';

const { Title } = Typography;

// Dados mockados
const mockData = {
    totalUsers: 150,
    totalForms: 45,
    completedForms: 32,
    recentSubmissions: [
        {
            id: 1,
            user: 'João Silva',
            form: 'Questionário de Satisfação',
            date: '2024-04-26',
            status: 'Completo',
        },
        {
            id: 2,
            user: 'Maria Santos',
            form: 'Avaliação de Desempenho',
            date: '2024-04-25',
            status: 'Pendente',
        },
        {
            id: 3,
            user: 'Pedro Oliveira',
            form: 'Pesquisa de Clima',
            date: '2024-04-24',
            status: 'Completo',
        },
    ],
};

const columns = [
    {
        title: 'Usuário',
        dataIndex: 'user',
        key: 'user',
    },
    {
        title: 'Formulário',
        dataIndex: 'form',
        key: 'form',
    },
    {
        title: 'Data',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <Tag color={status === 'Completo' ? 'green' : 'orange'}>
                {status}
            </Tag>
        ),
    },
];

export default function AdminDashboard() {
    return (
        <AdminAppLayout>
            <Row gutter={[24, 24]} style={{ padding: '24px' }}>
                <Col span={24}>
                    <Title level={2}>Dashboard Administrativo</Title>
                </Col>

                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total de Usuários"
                            value={mockData.totalUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total de Formulários"
                            value={mockData.totalForms}
                            prefix={<FormOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Formulários Completos"
                            value={mockData.completedForms}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Submissões Recentes">
                        <Table
                            dataSource={mockData.recentSubmissions}
                            columns={columns}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </AdminAppLayout>
    );
} 