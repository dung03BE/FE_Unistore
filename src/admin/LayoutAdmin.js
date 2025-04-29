import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    OrderedListOutlined,
    UserOutlined,
    TeamOutlined,
    GiftOutlined,
    SettingOutlined,
    UploadOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { setUserDetails } from '../actions/user';
import { removeToken } from '../services/localStorageService';
import { persistor } from "../store";
const { Header, Content, Sider } = Layout;

// Cấu hình menu
const menuItems = [
    {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Thống kê',
    },
    {
        key: 'products',
        icon: <ShoppingOutlined />,
        label: 'Quản lý sản phẩm',
        children: [
            {
                key: 'product-list',
                label: 'Danh sách sản phẩm',
            },
            {
                key: 'product-categories',
                label: 'Danh mục sản phẩm',
            },
        ],
    },
    {
        key: 'orders',
        icon: <OrderedListOutlined />,
        label: 'Quản lý đơn hàng',
    },
    {
        key: 'inventory',
        icon: <UserOutlined />,
        label: 'Quản lý kho',
    },
    {
        key: 'users',
        icon: <TeamOutlined />,
        label: 'Quản lý người dùng',
    },
    {
        key: 'recycle',
        icon: <SyncOutlined />,
        label: 'Quản lý yêu cầu tái chế',
    },
    {
        key: 'promotions',
        icon: <GiftOutlined />,
        label: 'Chương trình khuyến mãi'

    },
    {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Cấu hình hệ thống',
    },
    {
        key: 'logout',
        icon: <UploadOutlined />,
        label: 'Đăng xuất',
    },
];

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();

    // Xác định key active dựa vào đường dẫn hiện tại
    const getSelectedKey = () => {
        const path = location.pathname.split('/').filter(Boolean);
        if (path.length > 1 && path[0] === 'admin') {
            return path[1];
        }
        return 'dashboard';
    };
    const handleLogout = () => {
        removeToken();
        setUserDetails(null);
        persistor.purge();
        navigate('/login');

    };
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
            return; // Dừng xử lý tiếp nếu là logout
        }
        let path;
        // Xử lý điều hướng dựa trên key của menu
        switch (key) {
            case 'dashboard':
                path = '/admin/dashboard';
                break;
            case 'product-list':
                path = '/admin/products/list';
                break;
            case 'product-categories':
                path = '/admin/products/categories';
                break;
            case 'orders':
                path = '/admin/orders';
                break;
            case 'inventory':
                path = '/admin/inventory';
                break;
            case 'users':
                path = '/admin/users';
                break;
            case 'recycle':
                path = '/admin/recycle';
                break;
            case 'promotions':
                path = '/admin/promotions';
                break;
            case 'vouchers':
                path = '/admin/promotions/vouchers';
                break;
            case 'settings':
                path = '/admin/settings';
                break;
            case 'logout':
                path = '/logout';
                break;
            default:
                path = '/admin/dashboard';
        }
        navigate(path);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
                width={310}
            >
                <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    theme="dark"
                    defaultSelectedKeys={[getSelectedKey()]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}


                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 300, transition: 'all 0.2s' }}>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 24 }}>
                        <span>Trang quản trị</span>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;