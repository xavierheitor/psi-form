'use client';

import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();

    const onFinish = async (values: { email: string; password: string }) => {
        const result = await login(values.email, values.password);

        if (result.error) {
            message.error(result.error);
            return;
        }

        // Verifica se o usuário é admin
        const user = await getCurrentUser();

        message.success('Login realizado com sucesso!');
        router.push(user?.isAdmin ? '/admin' : '/');
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={8}>
                <Card title="Login">
                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Por favor, insira seu email!' },
                                { type: 'email', message: 'Email inválido!' }
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Entrar
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button type="link" onClick={() => router.push('/register')}>
                                Não tem uma conta? Cadastre-se
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
} 