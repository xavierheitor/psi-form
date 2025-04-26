'use client';

import { useState, useEffect } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, List, Typography, Button, message } from 'antd';
import { FormOutlined } from "@ant-design/icons";
import { getForms } from '@/lib/actions';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface Form {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
}

export default function Home() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const response = await getForms();
        if (response.success && response.forms) {
          setForms(response.forms.filter(form => form.isActive));
        }
      } catch (error) {
        message.error('Erro ao carregar formulários');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  return (
    <AppLayout>
      <Card>
        <Title level={2}>Formulários Disponíveis</Title>
        <Text type="secondary">Selecione um formulário para responder</Text>

        <List
          style={{ marginTop: 24 }}
          loading={loading}
          dataSource={forms}
          renderItem={(form) => (
            <List.Item
              actions={[
                <Button
                  key="responder"
                  type="primary"
                  icon={<FormOutlined />}
                  onClick={() => router.push(`/form/${form.id}`)}
                >
                  Responder
                </Button>
              ]}
            >
              <List.Item.Meta
                title={form.title}
                description={form.description || 'Sem descrição'}
              />
            </List.Item>
          )}
        />
      </Card>
    </AppLayout>
  );
}