import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, message } from 'antd';
import { ArrowUpOutlined, ShoppingCartOutlined, UserOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { getMonthlyRevenue, getOverview, getTopProductType, getTopSellingProducts } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Dashboard = () => {
    const [overview, setOverview] = useState({ revenue: 0, orders: 0, customers: 0, employees: 0 });
    const [revenueData, setRevenueData] = useState([]);
    const [topProductTypes, setTopProductTypes] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const overviewData = await getOverview();
                const revenueData = await getMonthlyRevenue();
                const productTypeData = await getTopProductType();
                const sellingProductsData = await getTopSellingProducts();
                console.log("sellingProductsData", sellingProductsData);
                setOverview(overviewData);
                setRevenueData(revenueData);
                setTopProductTypes(productTypeData);
                setTopSellingProducts(sellingProductsData);
            } catch (error) {
                console.log("API lỗi:", error.response);
                if (error.response && error.response.status === 403) {
                    message.error("Bạn không có quyền truy cập Dashboard!");
                    navigate("/unauthorized"); // Chuyển hướng đến trang Unauthorized
                } else {
                    message.error("Có lỗi xảy ra, vui lòng thử lại!");
                }
            }
        };
        fetchData();
    }, []);

    const revenueChartConfig = {
        data: revenueData,
        xField: 'month',
        yField: 'revenue',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            formatter: (datum) => `${(datum.revenue / 1000000).toFixed(0)}tr`,
        },
    };

    const bestSellerChartConfig = {
        data: topProductTypes,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
    };

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
        { title: 'Đã bán', dataIndex: 'sold', key: 'sold', sorter: (a, b) => a.sold - b.sold },
        { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (text) => `${(text / 1000000).toFixed(0)} triệu VNĐ`, sorter: (a, b) => a.revenue - b.revenue },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2}>Thống kê</Title>

            <Row gutter={16}>
                <Col span={6}><Card><Statistic title="Doanh thu tháng" value={overview.totalRevenue} precision={0} valueStyle={{ color: '#3f8600' }} prefix={<DollarOutlined />} formatter={(value) => `${(value / 1000000).toFixed(0)} triệu`} /></Card></Col>
                <Col span={6}><Card><Statistic title="Đơn hàng tháng" value={overview.totalOrders} valueStyle={{ color: '#3f8600' }} prefix={<ShoppingCartOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Khách hàng mới" value={overview.newCustomers} valueStyle={{ color: '#3f8600' }} prefix={<UserOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Nhân viên" value={overview.totalEmployees} valueStyle={{ color: '#1677ff' }} prefix={<TeamOutlined />} /></Card></Col>
            </Row>

            <Row gutter={16}>
                <Col span={16}><Card title="Doanh thu theo tháng"><Line {...revenueChartConfig} height={300} /></Card></Col>
                <Col span={8}><Card title="Sản phẩm bán chạy"><Pie {...bestSellerChartConfig} height={300} /></Card></Col>
            </Row>

            <Card title="Top 5 sản phẩm bán chạy">
                <Table columns={columns} dataSource={topSellingProducts || {}} pagination={false} />
            </Card>
        </Space>
    );
};

export default Dashboard;
