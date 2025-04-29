import React, { useState, useEffect } from 'react';
import { getRecycleByUserId } from '../../services/recycleService';
import { Typography, Button, Space, Divider, List, Pagination, Image } from 'antd';
import { BASE_URL } from "../../config";
const { Title, Text } = Typography;

function RecycleCondition() {
    const [recycleRequests, setRecycleRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        const fetchRecycleRequests = async () => {
            try {
                const data = await getRecycleByUserId();
                console.log("data", data);
                setRecycleRequests(data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchRecycleRequests();
    }, []);

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div>Lỗi: {error.message}</div>;
    }

    const statusCounts = {
        'Tất cả': recycleRequests.length,
        'Chờ xác nhận': recycleRequests.filter((req) => req.status === 'Chờ xác nhận').length,
        'Đang xử lý': recycleRequests.filter((req) => req.status === 'Đang xử lý').length,
        'Hoàn thành': recycleRequests.filter((req) => req.status === 'Hoàn thành').length,
    };

    const filteredRequests = selectedStatus === 'Tất cả'
        ? recycleRequests
        : recycleRequests.filter((req) => req.status === selectedStatus);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <div style={{ padding: '20px' }}> {/* Thêm padding cho container */}
            <Title level={2} style={{ color: '#1890ff', textAlign: 'center', marginBottom: '20px' }}>Đơn hàng tái chế của tôi</Title>
            <Space style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                {Object.keys(statusCounts).map((status) => (
                    <Button
                        key={status}
                        type={selectedStatus === status ? 'primary' : 'default'}
                        onClick={() => setSelectedStatus(status)}
                    >
                        {status} (<Text style={{ color: 'red' }}>{statusCounts[status]}</Text>)
                    </Button>
                ))}
            </Space>
            <Divider />
            <List
                dataSource={paginatedRequests}
                renderItem={(item) => {
                    const imageUrl = `${item.imageUrl}`;
                    return (
                        <List.Item style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>

                            <div style={{ flex: 1 }}> {/* Sử dụng flex để nội dung còn lại chiếm hết không gian */}
                                <List.Item.Meta
                                    title={<Text strong style={{ fontSize: '18px' }}>{item.deviceType}</Text>}
                                    description={<Text style={{ fontSize: '16px' }}>{`Tình trạng: ${item.deviceCondition}, Phương thức: ${item.pickupMethod}`}</Text>}
                                />

                                <Text type="secondary" style={{ marginTop: '8px' }}>Ngày tạo: {new Date(item.createdAt).toLocaleString()}</Text>
                                <br></br>
                                <div style={{ fontSize: '18px' }}>Trạng thái:
                                    <Text type="secondary" style={{ marginTop: '8px', fontSize: '15px', color: 'red' }}>  {item.status}</Text>
                                </div>
                            </div>
                            <Image
                                width={120} // Tăng kích thước ảnh
                                src={imageUrl}
                                alt="Recycle Image"
                                style={{ marginRight: '20px', borderRadius: '8px' }} // Thêm borderRadius
                            />
                        </List.Item>
                    );
                }}
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredRequests.length}
                onChange={handlePageChange}
                style={{ marginTop: '30px', textAlign: 'center' }} // Tăng marginTop
            />
        </div>
    );
}

export default RecycleCondition;