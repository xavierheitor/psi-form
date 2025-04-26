"use client";

import { Layout, Menu, theme, Typography, Button, Space, Dropdown } from "antd";
import {
    FormOutlined,
    HomeOutlined,
    DashboardOutlined,
    LogoutOutlined,
    UserOutlined,
    SettingOutlined,
    BarChartOutlined,
    TeamOutlined
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth";
import { MenuProps } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: "/",
            label: <Link href={{ pathname: "/" }}>Home</Link>,
            icon: <HomeOutlined />,
        },
        {
            key: "/admin",
            label: <Link href={{ pathname: "/admin" }}>Dashboard</Link>,
            icon: <DashboardOutlined />,
        },
        {
            key: "/admin/users",
            label: <Link href={{ pathname: "/admin/users" }}>Usuários</Link>,
            icon: <TeamOutlined />,
        },
        {
            key: "/admin/forms",
            label: <Link href={{ pathname: "/admin/perguntas" }}>Perguntas</Link>,
            icon: <FormOutlined />,
        },
        {
            key: "/admin/repsostas",
            label: <Link href={{ pathname: "/admin/respostas" }}>Opçoes de Resposta</Link>,
            icon: <FormOutlined />,
        },
        {
            key: "/admin/reports",
            label: <Link href={{ pathname: "/admin/reports" }}>Relatórios</Link>,
            icon: <BarChartOutlined />,
        },
    ];

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Meu Perfil',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Configurações',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            onClick: handleLogout,
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
                    PSI Form - Admin
                </Title>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    style={{ flex: 1, minWidth: 0 }}
                />
                <Space>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Button type="text" style={{ color: 'white' }}>
                            <Space>
                                <UserOutlined />
                                {user?.name || 'Admin'}
                            </Space>
                        </Button>
                    </Dropdown>
                </Space>
            </Header>
            <Content style={{ padding: "0 48px" }}>
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