'use client';

import { useState, useEffect } from 'react';
import { Table, Card, Space, Button, Modal, Form, Input, Switch, message, Tag, Typography, Select, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, OrderedListOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AdminAppLayout from '@/components/AdminAppLayout';
import { createForm, getForms, updateForm, deleteForm, getAllQuestions, addQuestionToForm, addAnswerOptionToQuestion, getAnswerOptions } from '@/lib/actions';

const { Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

interface Form {
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    questions: {
        id: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        formId: string;
        questionId: string;
        question: {
            id: string;
            text: string;
            answerOptions: {
                id: string;
                value: string;
                label: string;
            }[];
        };
    }[];
}

interface Question {
    id: string;
    text: string;
    answerOptions: {
        id: string;
        value: string;
        label: string;
    }[];
}

interface AnswerOption {
    id: string;
    label: string;
    value: string;
}

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isQuestionsModalVisible, setIsQuestionsModalVisible] = useState(false);
    const [isAnswerOptionsModalVisible, setIsAnswerOptionsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [form] = Form.useForm();
    const [questionForm] = Form.useForm();
    const [answerOptionForm] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [formsResult, questionsResult, answerOptionsResult] = await Promise.all([
                getForms(),
                getAllQuestions(),
                getAnswerOptions()
            ]);

            if (formsResult.success && formsResult.forms) {
                setForms(formsResult.forms);
            }

            if (questionsResult.success && questionsResult.questions) {
                setQuestions(questionsResult.questions);
            }

            if (answerOptionsResult.success && answerOptionsResult.answerOptions) {
                setAnswerOptions(answerOptionsResult.answerOptions);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            message.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        setLoading(true);
        try {
            const result = await createForm(
                values.title,
                values.description,
                values.isActive
            );
            if (result.success) {
                message.success('Formulário criado com sucesso');
                setIsModalVisible(false);
                form.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar formulário');
            }
        } catch (error) {
            console.error('Erro ao criar formulário:', error);
            message.error('Erro ao criar formulário');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!selectedForm) return;
        setLoading(true);
        try {
            const result = await updateForm(
                selectedForm.id,
                values.title,
                values.description,
                values.isActive
            );
            if (result.success) {
                message.success('Formulário atualizado com sucesso');
                setIsModalVisible(false);
                form.resetFields();
                setSelectedForm(null);
                loadData();
            } else {
                message.error(result.error || 'Erro ao atualizar formulário');
            }
        } catch (error) {
            console.error('Erro ao atualizar formulário:', error);
            message.error('Erro ao atualizar formulário');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const result = await deleteForm(id);
            if (result.success) {
                message.success('Formulário excluído com sucesso');
                loadData();
            } else {
                message.error(result.error || 'Erro ao excluir formulário');
            }
        } catch (error) {
            console.error('Erro ao excluir formulário:', error);
            message.error('Erro ao excluir formulário');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (values: { questionId: string; order: string }) => {
        if (!selectedForm) return;
        setLoading(true);
        try {
            const result = await addQuestionToForm(selectedForm.id, values.questionId, parseInt(values.order, 10));
            if (result.success) {
                message.success('Pergunta adicionada com sucesso');
                questionForm.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao adicionar pergunta');
            }
        } catch (error) {
            console.error('Erro ao adicionar pergunta:', error);
            message.error('Erro ao adicionar pergunta');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnswerOption = async (values: { answerOptionId: string }) => {
        if (!selectedForm) return;
        setLoading(true);
        try {
            // Para cada pergunta do formulário, vincular a opção de resposta
            const promises = selectedForm.questions.map(fq =>
                addAnswerOptionToQuestion(fq.question.id, values.answerOptionId)
            );

            const results = await Promise.all(promises);
            const hasError = results.some(result => !result.success);

            if (!hasError) {
                message.success('Opção de resposta adicionada com sucesso');
                answerOptionForm.resetFields();
                loadData();
            } else {
                message.error('Erro ao adicionar opção de resposta a algumas perguntas');
            }
        } catch (error) {
            console.error('Erro ao adicionar opção de resposta:', error);
            message.error('Erro ao adicionar opção de resposta');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
            render: (text: string | null) => text || '-',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
            ),
        },
        {
            title: 'Perguntas',
            key: 'questions',
            render: (_: any, record: Form) => (
                <Tag>{record.questions.length}</Tag>
            ),
        },
        {
            title: 'Opções de Resposta',
            key: 'answerOptions',
            render: (_: any, record: Form) => {
                const totalOptions = record.questions.reduce((acc, q) => acc + (q.question.answerOptions?.length || 0), 0);
                return <Tag>{totalOptions}</Tag>;
            },
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_: any, record: Form) => (
                <Space>
                    <Button
                        type="link"
                        icon={<OrderedListOutlined />}
                        onClick={() => {
                            setSelectedForm(record);
                            setIsQuestionsModalVisible(true);
                        }}
                    >
                        Perguntas
                    </Button>
                    <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => {
                            setSelectedForm(record);
                            setIsAnswerOptionsModalVisible(true);
                        }}
                    >
                        Respostas
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedForm(record);
                            form.setFieldsValue({
                                title: record.title,
                                description: record.description,
                                isActive: record.isActive,
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
                                content: 'Tem certeza que deseja excluir este formulário?',
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
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Space style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setSelectedForm(null);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                        >
                            Novo Formulário
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={forms}
                        rowKey="id"
                        loading={loading}
                    />
                </Card>

                <Modal
                    title={selectedForm ? 'Editar Formulário' : 'Novo Formulário'}
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                        setSelectedForm(null);
                    }}
                    onOk={() => form.submit()}
                    confirmLoading={loading}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={selectedForm ? handleUpdate : handleCreate}
                    >
                        <Form.Item
                            name="title"
                            label="Título"
                            rules={[{ required: true, message: 'Por favor, insira o título' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Descrição"
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label="Ativo"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Gerenciar Perguntas"
                    open={isQuestionsModalVisible}
                    onCancel={() => {
                        setIsQuestionsModalVisible(false);
                        setSelectedForm(null);
                    }}
                    footer={null}
                    width={800}
                >
                    {selectedForm && (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card>
                                <Title level={4}>Perguntas do Formulário</Title>
                                <Table
                                    dataSource={selectedForm.questions}
                                    rowKey="id"
                                    columns={[
                                        {
                                            title: 'Ordem',
                                            dataIndex: 'order',
                                            key: 'order',
                                        },
                                        {
                                            title: 'Pergunta',
                                            dataIndex: ['question', 'text'],
                                            key: 'text',
                                        },
                                    ]}
                                />
                            </Card>

                            <Card>
                                <Title level={5}>Adicionar Pergunta</Title>
                                <Form
                                    form={questionForm}
                                    layout="vertical"
                                    onFinish={handleAddQuestion}
                                >
                                    <Form.Item
                                        name="questionId"
                                        label="Pergunta"
                                        rules={[{ required: true, message: 'Por favor, selecione uma pergunta' }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Selecione uma pergunta"
                                            options={questions.map(q => ({
                                                value: q.id,
                                                label: q.text
                                            }))}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="order"
                                        label="Ordem"
                                        rules={[{ required: true, message: 'Por favor, insira a ordem' }]}
                                    >
                                        <Input type="number" />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Adicionar Pergunta
                                    </Button>
                                </Form>
                            </Card>
                        </Space>
                    )}
                </Modal>

                <Modal
                    title="Gerenciar Opções de Resposta"
                    open={isAnswerOptionsModalVisible}
                    onCancel={() => {
                        setIsAnswerOptionsModalVisible(false);
                        setSelectedForm(null);
                    }}
                    footer={null}
                    width={800}
                >
                    {selectedForm && (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card>
                                <Title level={4}>Opções de Resposta do Formulário</Title>
                                <Table
                                    dataSource={selectedForm.questions[0]?.question.answerOptions || []}
                                    rowKey="id"
                                    columns={[
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
                                    ]}
                                />
                            </Card>

                            <Card>
                                <Title level={5}>Adicionar Opção de Resposta</Title>
                                <Form
                                    form={answerOptionForm}
                                    layout="vertical"
                                    onFinish={handleAddAnswerOption}
                                >
                                    <Form.Item
                                        name="answerOptionId"
                                        label="Opção de Resposta"
                                        rules={[{ required: true, message: 'Por favor, selecione uma opção' }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Selecione uma opção de resposta"
                                            options={answerOptions.map(ao => ({
                                                value: ao.id,
                                                label: ao.label
                                            }))}
                                        />
                                    </Form.Item>

                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Adicionar Opção
                                    </Button>
                                </Form>
                            </Card>
                        </Space>
                    )}
                </Modal>
            </Space>
        </AdminAppLayout>
    );
} 