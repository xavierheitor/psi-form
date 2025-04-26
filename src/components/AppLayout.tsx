"use client";

import { Layout, Menu, theme, Typography, Button, Space } from "antd";
import { FormOutlined, HomeOutlined, DashboardOutlined, LogoutOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const user = await getCurrentUser();
            setIsAdmin(user?.isAdmin || false);
        };
        checkAdmin();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const menuItems = [
        {
            key: "/",
            label: <Link href="/">Home</Link>,
            icon: <HomeOutlined />,
        },
        ...(isAdmin ? [{
            key: "/admin",
            label: <Link href="/admin">Administração</Link>,
            icon: <DashboardOutlined />,
        }] : []),
        {
            key: "/form",
            label: <Link href="/form">Responder PSI</Link>,
            icon: <FormOutlined />,
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Title level={4} style={{ color: 'white', margin: 0, marginRight: '24px' }}>
                    PSI Form
                </Title>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <Space>
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        style={{ color: 'white' }}
                        onClick={handleLogout}
                    >
                        Sair
                    </Button>
                </Space>
            </Header>
            <Content style={{ padding: "0 48px" }}>
                {/* <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>List</Breadcrumb.Item>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                </Breadcrumb> */}
                <Content
                    style={{
                        margin: "16px 0",
                        padding: 24,
                        minHeight: 380,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Content>
            <Footer style={{ textAlign: "center" }}>
                PSI Form ©{new Date().getFullYear()} Criado por Xavier Heitor
            </Footer>
        </Layout>
    );
}