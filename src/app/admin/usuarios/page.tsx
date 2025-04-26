'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createUser, getUsers, updateUser, deleteUser } from '@/lib/actions';
import AdminAppLayout from '@/components/AdminAppLayout';

interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await getUsers();
            if (result.success && result.users) {
                setUsers(result.users);
            } else {
                message.error('Erro ao carregar usuários');
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            message.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        setLoading(true);
        try {
            const result = await createUser(
                values.name,
                values.email,
                values.password,
                values.isAdmin
            );
            if (result.success) {
                message.success('Usuário criado com sucesso');
                setIsModalVisible(false);
                form.resetFields();
                loadUsers();
            } else {
                message.error(result.error || 'Erro ao criar usuário');
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            message.error('Erro ao criar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const result = await updateUser(
                selectedUser.id,
                values.name,
                values.email,
                values.isAdmin
            );
            if (result.success) {
                message.success('Usuário atualizado com sucesso');
                setIsModalVisible(false);
                form.resetFields();
                setSelectedUser(null);
                loadUsers();
            } else {
                message.error(result.error || 'Erro ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            message.error('Erro ao atualizar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const result = await deleteUser(id);
            if (result.success) {
                message.success('Usuário excluído com sucesso');
                loadUsers();
            } else {
                message.error(result.error || 'Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            message.error('Erro ao excluir usuário');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Admin',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin: boolean) => (
                <Tag color={isAdmin ? 'blue' : 'default'}>
                    {isAdmin ? 'Sim' : 'Não'}
                </Tag>
            ),
        },
        {
            title: 'Data de Criação',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: Date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: User) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            form.setFieldsValue({
                                name: record.name,
                                email: record.email,
                                isAdmin: record.isAdmin,
                            });
                            setIsModalVisible(true);
                        }}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Confirmar exclusão',
                                content: 'Tem certeza que deseja excluir este usuário?',
                                onOk: () => handleDelete(record.id),
                            });
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <AdminAppLayout>
            <Card>
                <Space style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedUser(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Novo Usuário
                    </Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                />

                <Modal
                    title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                        setSelectedUser(null);
                    }}
                    onOk={() => form.submit()}
                    confirmLoading={loading}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={selectedUser ? handleUpdate : handleCreate}
                    >
                        <Form.Item
                            name="name"
                            label="Nome"
                            rules={[{ required: true, message: 'Por favor, insira o nome' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Por favor, insira o email' },
                                { type: 'email', message: 'Por favor, insira um email válido' },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        {!selectedUser && (
                            <Form.Item
                                name="password"
                                label="Senha"
                                rules={[{ required: true, message: 'Por favor, insira a senha' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="isAdmin"
                            label="Administrador"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </AdminAppLayout>
    );
} 