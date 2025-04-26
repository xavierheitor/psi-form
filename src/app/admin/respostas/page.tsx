'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Typography, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { createAnswerOption, getAnswerOptions, updateAnswerOption, deleteAnswerOption } from '@/lib/actions';

const { Title } = Typography;

interface AnswerOption {
    id: string;
    value: string;
    label: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function RespostasPage() {
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<AnswerOption[]>([]);
    const [form] = Form.useForm();
    const [batchForm] = Form.useForm();

    useEffect(() => {
        console.log('[Client] RespostasPage - Componente montado');
        loadData();
    }, []);

    const loadData = async () => {
        console.log('[Client] RespostasPage - Carregando dados');
        try {
            const result = await getAnswerOptions();
            console.log('[Client] RespostasPage - Dados carregados:', result);
            if (result.success) {
                setAnswerOptions(result.answerOptions);
            }
        } catch (error) {
            console.error('[Client] RespostasPage - Erro ao carregar dados:', error);
            message.error('Erro ao carregar opções de resposta');
        }
    };

    const handleCreateAnswerOption = async (values: { value: string; label: string }) => {
        console.log('[Client] RespostasPage - Criando opção:', values);
        setLoading(true);
        try {
            const result = await createAnswerOption(values.value, values.label);
            console.log('[Client] RespostasPage - Resultado da criação:', result);
            if (result.success) {
                message.success('Opção de resposta criada com sucesso!');
                setIsModalVisible(false);
                form.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar opção de resposta');
            }
        } catch (error) {
            console.error('[Client] RespostasPage - Erro ao criar opção:', error);
            message.error('Erro ao criar opção de resposta');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatchAnswerOptions = async (values: { options: string }) => {
        console.log('[Client] RespostasPage - Criando opções em lote:', values);
        setLoading(true);
        try {
            const options = values.options.split('\n').filter(opt => opt.trim());
            console.log('[Client] RespostasPage - Opções processadas:', options);
            const results = await Promise.all(
                options.map(opt => {
                    const [value, label] = opt.split('|').map(s => s.trim());
                    return createAnswerOption(value, label);
                })
            );
            console.log('[Client] RespostasPage - Resultado da criação em lote:', results);
            if (results.every(result => result.success)) {
                message.success('Opções de resposta criadas com sucesso!');
                setIsBatchModalVisible(false);
                batchForm.resetFields();
                loadData();
            } else {
                message.error('Erro ao criar algumas opções de resposta');
            }
        } catch (error) {
            console.error('[Client] RespostasPage - Erro ao criar opções em lote:', error);
            message.error('Erro ao criar opções de resposta');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAnswerOption = async (id: string, values: { value: string; label: string }) => {
        console.log('[Client] RespostasPage - Atualizando opção:', { id, values });
        setLoading(true);
        try {
            const result = await updateAnswerOption(id, values.value, values.label);
            console.log('[Client] RespostasPage - Resultado da atualização:', result);
            if (result.success) {
                message.success('Opção de resposta atualizada com sucesso!');
                loadData();
            } else {
                message.error(result.error || 'Erro ao atualizar opção de resposta');
            }
        } catch (error) {
            console.error('[Client] RespostasPage - Erro ao atualizar opção:', error);
            message.error('Erro ao atualizar opção de resposta');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnswerOptions = async () => {
        console.log('[Client] RespostasPage - Excluindo opções:', selectedRows);
        if (selectedRows.length === 0) {
            message.warning('Selecione pelo menos uma opção de resposta para excluir');
            return;
        }

        Modal.confirm({
            title: 'Confirmar exclusão',
            content: `Tem certeza que deseja excluir ${selectedRows.length} opção(ões) de resposta?`,
            onOk: async () => {
                setLoading(true);
                try {
                    const results = await Promise.all(
                        selectedRows.map(option => deleteAnswerOption(option.id))
                    );
                    console.log('[Client] RespostasPage - Resultado da exclusão:', results);
                    if (results.every(result => result.success)) {
                        message.success('Opções de resposta excluídas com sucesso!');
                        setSelectedRows([]);
                        loadData();
                    } else {
                        message.error('Erro ao excluir algumas opções de resposta');
                    }
                } catch (error) {
                    console.error('[Client] RespostasPage - Erro ao excluir opções:', error);
                    message.error('Erro ao excluir opções de resposta');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const columns = [
        {
            title: 'Valor',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Rótulo',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: AnswerOption) => (
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
                            <Title level={2}>Gerenciamento de Opções de Resposta</Title>

                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    Nova Opção
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
                                        onClick={handleDeleteAnswerOptions}
                                    >
                                        Excluir Selecionados
                                    </Button>
                                )}
                            </Space>

                            <Table
                                columns={columns}
                                dataSource={answerOptions}
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
                title="Nova Opção de Resposta"
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
                    onFinish={handleCreateAnswerOption}
                >
                    <Form.Item
                        name="value"
                        label="Valor"
                        rules={[{ required: true, message: 'Por favor, insira o valor!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="label"
                        label="Rótulo"
                        rules={[{ required: true, message: 'Por favor, insira o rótulo!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Salvar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Adicionar Opções em Lote"
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
                    onFinish={handleCreateBatchAnswerOptions}
                >
                    <Form.Item
                        name="options"
                        label="Opções (uma por linha, formato: valor|rótulo)"
                        rules={[{ required: true, message: 'Por favor, insira as opções!' }]}
                    >
                        <Input.TextArea rows={10} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar Opções
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </AdminAppLayout>
    );
} 