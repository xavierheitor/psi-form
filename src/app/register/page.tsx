'use client';

import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();

    const onFinish = async (values: { name: string; email: string; password: string; confirmPassword: string }) => {
        if (values.password !== values.confirmPassword) {
            message.error('As senhas não coincidem!');
            return;
        }

        const result = await register(values.name, values.email, values.password);

        if (result.error) {
            message.error(result.error);
            return;
        }

        message.success('Cadastro realizado com sucesso!');
        router.push('/login');
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={8}>
                <Card title="Cadastro">
                    <Form
                        name="register"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Nome completo" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Por favor, insira seu email!' },
                                { type: 'email', message: 'Email inválido!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Por favor, confirme sua senha!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('As senhas não coincidem!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar senha" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Cadastrar
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button type="link" onClick={() => router.push('/login')}>
                                Já tem uma conta? Faça login
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
} 