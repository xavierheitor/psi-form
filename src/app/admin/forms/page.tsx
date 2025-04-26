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
        console.log('[Client] FormsPage - Componente montado');
        loadData();
    }, []);

    const loadData = async () => {
        console.log('[Client] FormsPage - Carregando dados');
        try {
            const result = await getQuestions();
            console.log('[Client] FormsPage - Dados carregados:', result);
            if (result.success) {
                setQuestions(result.questions);
            }
        } catch (error) {
            console.error('[Client] FormsPage - Erro ao carregar dados:', error);
            message.error('Erro ao carregar perguntas');
        }
    };

    const handleCreateQuestion = async (values: { text: string }) => {
        console.log('[Client] FormsPage - Criando pergunta:', values);
        setLoading(true);
        try {
            const result = await createQuestion(values.text);
            console.log('[Client] FormsPage - Resultado da criação:', result);
            if (result.success) {
                message.success('Pergunta criada com sucesso!');
                setIsModalVisible(false);
                form.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar pergunta');
            }
        } catch (error) {
            console.error('[Client] FormsPage - Erro ao criar pergunta:', error);
            message.error('Erro ao criar pergunta');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatchQuestions = async (values: { questions: string }) => {
        console.log('[Client] FormsPage - Criando perguntas em lote:', values);
        setLoading(true);
        try {
            const questions = values.questions.split('\n').filter(q => q.trim());
            console.log('[Client] FormsPage - Perguntas processadas:', questions);
            const result = await createBatchQuestions(questions);
            console.log('[Client] FormsPage - Resultado da criação em lote:', result);
            if (result.success) {
                message.success('Perguntas criadas com sucesso!');
                setIsBatchModalVisible(false);
                batchForm.resetFields();
                loadData();
            } else {
                message.error(result.error || 'Erro ao criar perguntas');
            }
        } catch (error) {
            console.error('[Client] FormsPage - Erro ao criar perguntas em lote:', error);
            message.error('Erro ao criar perguntas');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuestion = async (id: string, values: { text: string }) => {
        console.log('[Client] FormsPage - Atualizando pergunta:', { id, values });
        setLoading(true);
        try {
            const result = await updateQuestion(id, values.text);
            console.log('[Client] FormsPage - Resultado da atualização:', result);
            if (result.success) {
                message.success('Pergunta atualizada com sucesso!');
                loadData();
            } else {
                message.error(result.error || 'Erro ao atualizar pergunta');
            }
        } catch (error) {
            console.error('[Client] FormsPage - Erro ao atualizar pergunta:', error);
            message.error('Erro ao atualizar pergunta');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestions = async () => {
        console.log('[Client] FormsPage - Excluindo perguntas:', selectedRows);
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
                    console.log('[Client] FormsPage - Resultado da exclusão:', results);
                    if (results.every(result => result.success)) {
                        message.success('Perguntas excluídas com sucesso!');
                        setSelectedRows([]);
                        loadData();
                    } else {
                        message.error('Erro ao excluir algumas perguntas');
                    }
                } catch (error) {
                    console.error('[Client] FormsPage - Erro ao excluir perguntas:', error);
                    message.error('Erro ao excluir perguntas');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // ... resto do código permanece igual ...
} 