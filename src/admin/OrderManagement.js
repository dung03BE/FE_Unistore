import React, { useState, useEffect, useRef } from 'react';
import { getOrderList, putStatusOrder } from '../services/orderService'; // Import putStatusOrder
import styles from './OrderManagement.module.scss';
import { Table, Input, Select, Spin, message } from 'antd';

const { Option } = Select;

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [fullNameFilter, setFullNameFilter] = useState('');
    const [totalMoneyFilter, setTotalMoneyFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchFullName, setSearchFullName] = useState('');
    const [searchTotalMoney, setSearchTotalMoney] = useState('');
    const [searchActive, setSearchActive] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState(null); // Thêm state
    const debounceRef = useRef(null);

    const statusOptions = [
        { value: 'pending', label: 'Chờ xác nhận' },
        { value: 'processing', label: 'Đang xử lý' },
        { value: 'shipped', label: 'Đang giao' },
        { value: 'delivered', label: 'Hoàn tất' },
        { value: 'cancelled', label: 'Đã hủy' },
    ];

    const getStatusLabel = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.label : status;
    };

    useEffect(() => {
        fetchOrders();
    }, [searchFullName, searchTotalMoney, searchActive]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getOrderList(searchFullName, searchTotalMoney, searchActive);
            const updatedOrders = result.map(order => ({
                ...order,
                statusDisplay: getStatusLabel(order.status), // Thêm trường hiển thị trạng thái
            }));
            setOrders(updatedOrders);
        } catch (err) {
            setError(err);
            console.error('Lỗi khi lấy danh sách đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFullNameChange = (e) => {
        setFullNameFilter(e.target.value);
    };

    const handleTotalMoneyChange = (e) => {
        setTotalMoneyFilter(e.target.value);
    };

    const handleActiveChange = (value) => {
        setActiveFilter(value === undefined ? null : value);
    };

    const handleOrderClick = (order) => {
        setSelectedOrderDetails(order.order_details);
        setSelectedOrderId(order.id);
        setSelectedOrder(order);
        setSelectedOrderStatus(order.status); // Cập nhật selectedOrderStatus
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        setSearchFullName(fullNameFilter);
        setSearchTotalMoney(totalMoneyFilter);
        setSearchActive(activeFilter);
    };

    const handleOrderStatusChange = (newStatus) => {
        setSelectedOrderStatus(newStatus); // Update state ngay lập tức

        if (debounceRef.current) {
            clearTimeout(debounceRef.current); // Clear timeout nếu có
        }

        debounceRef.current = setTimeout(async () => {
            try {
                await putStatusOrder(selectedOrderId, newStatus);
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === selectedOrderId ? { ...order, status: newStatus, statusDisplay: getStatusLabel(newStatus) } : order
                    )
                );
                message.success('Cập nhật trạng thái thành công');
            } catch (error) {
                console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
                message.error('Cập nhật trạng thái thất bại');
            }
        }, 2000); // Delay 2 giây
    };

    const columns = [
        { title: 'Mã đơn hàng', dataIndex: 'id', key: 'id' },
        { title: 'Tên Khách Hàng', dataIndex: 'fullname', key: 'fullname' },
        { title: 'Địa Chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Số Điện Thoại', dataIndex: 'phone_number', key: 'phone_number' },
        { title: 'Ngày Đặt', dataIndex: 'order_date', key: 'order_date', render: (date) => new Date(date).toLocaleString() },
        { title: 'Tổng Tiền', dataIndex: 'total_money', key: 'total_money' },
        { title: 'Trạng Thái', dataIndex: 'statusDisplay', key: 'status' }, // Hiển thị statusDisplay
    ];

    const detailColumns = [
        { title: 'Mã sản phẩm', dataIndex: 'id', key: 'id' },
        { title: 'Sản Phẩm', dataIndex: ['productResponses', 0, 'name'], key: 'name' },
        { title: 'Màu Sắc', dataIndex: 'color', key: 'color' },
        { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Giá', dataIndex: 'price', key: 'price' },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    if (error) {
        return <div>Lỗi: {error.message}</div>;
    }

    return (
        <div className={styles.orderManagement}>
            <h2>Quản Lý Đơn Hàng</h2>

            <div className={styles.filterContainer}>
                <div className={styles.filterItem}>
                    <label>Tên Khách Hàng:</label>
                    <Input value={fullNameFilter} onChange={handleFullNameChange} onKeyDown={handleKeyDown} />
                </div>

                <div className={styles.filterItem}>
                    <label>Tổng Tiền:</label>
                    <Input type="number" value={totalMoneyFilter} onChange={handleTotalMoneyChange} onKeyDown={handleKeyDown} />
                </div>

                <div className={styles.filterItem}>
                    <label>Trạng Thái:</label>
                    <Select value={activeFilter} onChange={handleActiveChange} onBlur={handleSearch} allowClear>
                        <Option value={true}>Đang kích hoạt</Option>
                        <Option value={false}>Không kích hoạt</Option>
                    </Select>
                </div>
            </div>

            <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => handleOrderClick(record),
                })}
                className={styles.orderTable}
            />

            {selectedOrderDetails && selectedOrder && (
                <div className={styles.orderDetails}>
                    <h3>Chi Tiết Đơn Hàng #{selectedOrderId}</h3>
                    <div className={styles.orderInfo}>
                        <p>
                            Trạng thái:
                            <Select
                                value={selectedOrderStatus}
                                onChange={handleOrderStatusChange}
                                style={{ width: '200px' }}
                            >
                                {statusOptions.map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </p>
                        <p>Tên khách hàng: {selectedOrder.fullname}</p>
                        <p>Địa chỉ: {selectedOrder.address}</p>
                        <p>Số điện thoại: {selectedOrder.phone_number}</p>
                        <p>Ngày đặt hàng: {new Date(selectedOrder.order_date).toLocaleString()}</p>
                        <p>Tổng tiền: {selectedOrder.total_money}</p>
                        <p>Trạng thái: {getStatusLabel(selectedOrder.status)}</p> {/* Hiển thị label */}
                        <p>Phương thức giao hàng: {selectedOrder.shipping_method}</p>
                        <p>Phương thức thanh toán: {selectedOrder.payment_method}</p>
                    </div>

                    <Table
                        dataSource={selectedOrderDetails}
                        columns={detailColumns}
                        rowKey="id"
                        className={styles.detailTable}
                    />
                </div>
            )}
        </div>
    );
}

export default OrderManagement;