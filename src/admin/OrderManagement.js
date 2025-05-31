import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getOrderList, putStatusOrder } from '../services/orderService'; // Import putStatusOrder
import styles from './OrderManagement.module.scss';
import { Table, Input, Select, Spin, message, Button } from 'antd';

const { Option } = Select;

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // Lưu trữ tất cả đơn hàng
    const [fullNameFilter, setFullNameFilter] = useState('');
    const [totalMoneyFilter, setTotalMoneyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [searchFullName, setSearchFullName] = useState('');
    const [searchTotalMoney, setSearchTotalMoney] = useState('');
    const [searchActive, setSearchActive] = useState(null); // Giữ lại để truyền đến API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState(null);
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

    // Lọc đơn hàng theo trạng thái và các bộ lọc khác
    useEffect(() => {
        if (allOrders.length > 0) {
            let filteredOrders = [...allOrders];

            // Lọc theo tên khách hàng nếu có
            if (fullNameFilter) {
                filteredOrders = filteredOrders.filter(order =>
                    order.fullname.toLowerCase().includes(fullNameFilter.toLowerCase())
                );
            }

            // Lọc theo tổng tiền nếu có
            if (totalMoneyFilter) {
                filteredOrders = filteredOrders.filter(order =>
                    order.total_money.toString().includes(totalMoneyFilter)
                );
            }

            // Lọc theo trạng thái nếu có
            if (statusFilter) {
                filteredOrders = filteredOrders.filter(order =>
                    order.status === statusFilter
                );
            }

            setOrders(filteredOrders);
        }
    }, [fullNameFilter, totalMoneyFilter, statusFilter, allOrders]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi API với các tham số gốc
            const result = await getOrderList(searchFullName, searchTotalMoney, searchActive);
            const updatedOrders = result.map(order => ({
                ...order,
                statusDisplay: getStatusLabel(order.status),
            }));
            setAllOrders(updatedOrders); // Lưu tất cả đơn hàng
            setOrders(updatedOrders); // Hiển thị ban đầu tất cả đơn hàng
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

    const handleStatusChange = (value) => {
        console.log('Selected status:', value);
        setStatusFilter(value);
    };

    const handleOrderClick = (order) => {
        setSelectedOrderDetails(order.order_details);
        setSelectedOrderId(order.id);
        setSelectedOrder(order);
        setSelectedOrderStatus(order.status);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        setSearchFullName(fullNameFilter);
        setSearchTotalMoney(totalMoneyFilter);
        setSearchActive(null); // Giữ nguyên tham số API
    };

    const handleResetFilters = () => {
        setFullNameFilter('');
        setTotalMoneyFilter('');
        setStatusFilter(null);
    };

    const handleOrderStatusChange = (newStatus) => {
        setSelectedOrderStatus(newStatus);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
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
        }, 2000);
    };

    const columns = [
        { title: 'Mã đơn hàng', dataIndex: 'id', key: 'id' },
        { title: 'Tên Khách Hàng', dataIndex: 'fullname', key: 'fullname' },
        { title: 'Địa Chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Số Điện Thoại', dataIndex: 'phone_number', key: 'phone_number' },
        { title: 'Ngày Đặt', dataIndex: 'order_date', key: 'order_date', render: (date) => new Date(date).toLocaleString() },
        { title: 'Tổng Tiền', dataIndex: 'total_money', key: 'total_money' },
        { title: 'Trạng Thái', dataIndex: 'statusDisplay', key: 'status' },
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
                    <Input value={fullNameFilter} onChange={handleFullNameChange} />
                </div>

                <div className={styles.filterItem}>
                    <label>Tổng Tiền:</label>
                    <Input type="number" value={totalMoneyFilter} onChange={handleTotalMoneyChange} />
                </div>

                <div className={styles.filterItem}>
                    <label>Trạng Thái:</label>
                    <Select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        allowClear
                        placeholder="Chọn trạng thái"
                        style={{ width: '100%' }}
                    >
                        {statusOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                </div>

                <div className={styles.filterItem}>


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
                        <p>Trạng thái: {getStatusLabel(selectedOrder.status)}</p>
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
