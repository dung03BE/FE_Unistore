import React, { useEffect, useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SyncOutlined,
    UploadOutlined,
    UsergroupAddOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { useSelector } from 'react-redux';
import { PersonalInfo } from './PersonalInfo';
import { OrderList } from './OrderList';
import { removeToken } from '../../services/localStorageService';
import { setUserDetails } from '../../actions/user';
import { useNavigate } from 'react-router-dom';
import { persistor } from "../../store";
import RecycleCondition from './RecycleCondition';
const { Header, Sider, Content } = Layout;

const Profile = () => {
    const userDetails = useSelector(state => state.userReducer.userDetails);
    // Set collapsed to false by default to show full text
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('1');
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const handleMenuClick = ({ key }) => {
        if (key === '5') {
            handleLogout();
        } else {
            setSelectedMenu(key);
        }
    };
    let contentToRender;
    if (selectedMenu === '1') {
        contentToRender = <PersonalInfo userDetails={userDetails} />;
    } else if (selectedMenu === '2') {
        console.log("Đã chạy vào đây");
        contentToRender = <OrderList />;
    } else {
        contentToRender = <RecycleCondition />;
    }
    const handleLogout = () => {
        removeToken();
        setUserDetails(null);
        persistor.purge();
        navigate('/login');

    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={280} // Increase width to fit longer text
                style={{
                    overflow: 'auto',
                    height: '150vh',
                    position: 'relative',
                    left: 0,
                }}
            >
                <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        {
                            key: '1',
                            icon: <UserOutlined />,
                            label: 'Thông tin cá nhân',
                        },
                        {
                            key: '2',
                            icon: <VideoCameraOutlined />,
                            label: 'Đơn hàng của tôi',
                        },
                        {
                            key: '3',
                            icon: <UsergroupAddOutlined />,
                            label: 'Khách hàng thân thiết',
                        },
                        {
                            key: '4',
                            icon: <SyncOutlined />,
                            label: 'Trạng thái tái chế',
                        },
                        {
                            key: '5',
                            icon: <UploadOutlined />,
                            label: 'Đăng xuất',
                        }
                    ]}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 10 }}>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                    key={selectedMenu}
                >
                    {contentToRender}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Profile;