import { useEffect, useState } from "react";
import { getAllRecycleRequest, putStatusRecycleRq } from "../services/recycleService";
import { Image, message, Select, Table } from "antd";
import { colors } from "@mui/material";
import { BASE_URL } from "../config";
function RecycleManagement() {
    const [recycleRequests, setRecycleRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [filteredRequests, setFilteredRequests] = useState([]);

    useEffect(() => {
        const fetchRecycleRequests = async () => {
            try {
                const data = await getAllRecycleRequest();
                setRecycleRequests(data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách yêu cầu tái chế:", error);
                setLoading(false);
            }
        };

        fetchRecycleRequests();
    }, []);

    useEffect(() => {
        if (selectedStatusFilter === 'all') {
            setFilteredRequests(recycleRequests);
        } else {
            setFilteredRequests(recycleRequests.filter(request => request.status === selectedStatusFilter));
        }
    }, [recycleRequests, selectedStatusFilter]);

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await putStatusRecycleRq(requestId, { status: newStatus });
            setRecycleRequests(recycleRequests.map(request => {
                if (request.id === requestId) {
                    return { ...request, status: newStatus };
                }
                return request;
            }));
            message.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error('Cập nhật trạng thái thất bại!');
        }
    };

    const handleStatusFilterChange = (value) => {
        setSelectedStatusFilter(value);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Loại thiết bị', dataIndex: 'deviceType', key: 'deviceType' },
        { title: 'Tình trạng', dataIndex: 'deviceCondition', key: 'deviceCondition' },
        { title: 'Phương thức nhận', dataIndex: 'pickupMethod', key: 'pickupMethod' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                let statusStyle = {};
                if (status === "Hoàn thành") {
                    statusStyle = {
                        textDecoration: 'line-through',
                        backgroundColor: 'red',
                        color: 'white',
                    };
                } else if (status === "Đang xử lý") {
                    statusStyle = {
                        backgroundColor: '#b7eb8f',
                    };
                } else if (status === "Chờ xác nhận") {
                    statusStyle = {
                        backgroundColor: '#fff2e8',
                    };
                }

                return (
                    <Select
                        value={status}
                        onChange={(value) => handleStatusChange(record.id, value)}
                        style={{ width: 170, ...statusStyle }}
                    >
                        <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
                        <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
                        <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                    </Select>
                );
            },
            filters: [
                { text: 'Tất cả', value: 'all' },
                { text: 'Chờ xác nhận', value: 'Chờ xác nhận' },
                { text: 'Đang xử lý', value: 'Đang xử lý' },
                { text: 'Hoàn thành', value: 'Hoàn thành' },
            ],
            onFilter: (value, record) => {
                if (value === 'all') {
                    return true;
                }
                return record.status === value;
            },
        },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl) => {
                if (imageUrl) {
                    const imageUrls = `${imageUrl}`;
                    return <Image src={imageUrls} alt="Thiết bị" width={100} height={50} />;
                }
                return null;
            },
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <span style={{ marginRight: 8 }}>Lọc theo trạng thái:</span>
                <Select
                    defaultValue="all"
                    style={{ width: 170 }}
                    onChange={handleStatusFilterChange}
                >
                    <Select.Option value="all">Tất cả</Select.Option>
                    <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
                    <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
                    <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                </Select>
            </div>
            <Table dataSource={filteredRequests} columns={columns} loading={loading} rowKey="id" style={{ fontSize: '20px' }} />
        </>
    )
}
export default RecycleManagement;