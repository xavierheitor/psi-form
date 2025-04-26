import AppLayout from "@/components/AppLayout";
import { Button } from "antd";
import { FormOutlined } from "@ant-design/icons";
export default function Home() {
  return (
    <AppLayout>
      <h1>Bem-vindo ao PSI Form!</h1>
      <p>Essa é a página inicial.</p>
      <Button icon={<FormOutlined />} href="/form">Responder Formulário</Button>
    </AppLayout>
  );
}