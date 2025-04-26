'use client';

import { useState, useEffect } from 'react';
import { Card, Space, Button, Form, Select, Typography, message } from 'antd';
import { getForms } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface Form {
    id: string;
    title: string;
    description: string | null;
}

export default function FormPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        setLoading(true);
        try {
            const result = await getForms();
            if (result.success && result.forms) {
                setForms(result.forms);
            }
        } catch (error) {
            console.error('Erro ao carregar formulários:', error);
            message.error('Erro ao carregar formulários');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (values: { formId: string }) => {
        router.push(`/form/${values.formId}`);
    };

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>Selecione um Formulário</Title>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="formId"
                        label="Formulário"
                        rules={[{ required: true, message: 'Por favor, selecione um formulário' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Selecione um formulário"
                            loading={loading}
                            options={forms.map(form => ({
                                value: form.id,
                                label: form.title,
                                description: form.description
                            }))}
                            optionFilterProp="label"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Responder Formulário
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
} 