'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Typography, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { createQuestion, createBatchQuestions, getQuestions, updateQuestion, deleteQuestion } from '@/lib/actions';

const { Title } = Typography;

interface Question {
    id: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function FormsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Question[]>([]);
    const [form] = Form.useForm();
    const [batchForm] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await getQuestions();
            if (result.success) {
                setQuestions(result.questions);
            }
        } catch (error) {
            message.error('Erro ao carregar perguntas');
        }
    };

    const handleCreateQuestion = async (values: { text: string }) => {
        setLoading(true);
        try {
            const result = await createQuestion(values.text);
            if (result.success) {
                message.success('Pergunta criada com sucesso!');
                setIsModalVisible(false);
                form.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar pergunta');
            }
        } catch (error) {
            message.error('Erro ao criar pergunta');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatchQuestions = async (values: { questions: string }) => {
        setLoading(true);
        try {
            const questions = values.questions.split('\n').filter(q => q.trim());
            const result = await createBatchQuestions(questions);
            if (result.success) {
                message.success('Perguntas criadas com sucesso!');
                setIsBatchModalVisible(false);
                batchForm.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar perguntas');
            }
        } catch (error) {
            message.error('Erro ao criar perguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuestion = async (id: string, values: { text: string }) => {
        setLoading(true);
        try {
            const result = await updateQuestion(id, values.text);
            if (result.success) {
                message.success('Pergunta atualizada com sucesso!');
                loadData();
            } else {
                message.error(result.error || 'Erro ao atualizar pergunta');
            }
        } catch (error) {
            message.error('Erro ao atualizar pergunta');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestions = async () => {
        if (selectedRows.length === 0) {
            message.warning('Selecione pelo menos uma pergunta para excluir');
            return;
        }

        Modal.confirm({
            title: 'Confirmar exclusão',
            content: `Tem certeza que deseja excluir ${selectedRows.length} pergunta(s)?`,
            onOk: async () => {
                setLoading(true);
                try {
                    const results = await Promise.all(
                        selectedRows.map(question => deleteQuestion(question.id))
                    );

                    if (results.every(result => result.success)) {
                        message.success('Perguntas excluídas com sucesso!');
                        setSelectedRows([]);
                        loadData();
                    } else {
                        message.error('Erro ao excluir algumas perguntas');
                    }
                } catch (error) {
                    message.error('Erro ao excluir perguntas');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const columns = [
        {
            title: 'Pergunta',
            dataIndex: 'text',
            key: 'text',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Question) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                            form.setFieldsValue(record);
                            setIsModalVisible(true);
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <AdminAppLayout>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={2}>Gerenciamento de Perguntas</Title>

                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    Nova Pergunta
                                </Button>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsBatchModalVisible(true)}
                                >
                                    Adicionar em Lote
                                </Button>
                                {selectedRows.length > 0 && (
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={handleDeleteQuestions}
                                    >
                                        Excluir Selecionados
                                    </Button>
                                )}
                            </Space>

                            <Table
                                columns={columns}
                                dataSource={questions}
                                rowKey="id"
                                loading={loading}
                                rowSelection={{
                                    type: 'checkbox',
                                    onChange: (_, selectedRows) => {
                                        setSelectedRows(selectedRows);
                                    },
                                }}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Nova Pergunta"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateQuestion}
                >
                    <Form.Item
                        name="text"
                        label="Texto da Pergunta"
                        rules={[{ required: true, message: 'Por favor, insira o texto da pergunta!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Salvar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Adicionar Perguntas em Lote"
                open={isBatchModalVisible}
                onCancel={() => {
                    setIsBatchModalVisible(false);
                    batchForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={batchForm}
                    layout="vertical"
                    onFinish={handleCreateBatchQuestions}
                >
                    <Form.Item
                        name="questions"
                        label="Perguntas (uma por linha)"
                        rules={[{ required: true, message: 'Por favor, insira as perguntas!' }]}
                    >
                        <Input.TextArea rows={10} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar Perguntas
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </AdminAppLayout>
    );
} 