// OrderList.js
import React, { useState, useEffect } from 'react';
import { getOrderByUserId } from '../../services/paymentService';
import { Collapse, Badge } from 'antd'; // Import Badge
import { useNavigate } from 'react-router-dom';
const { Panel } = Collapse;

export const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [statusCounts, setStatusCounts] = useState({}); // State to store counts
    const navigate = useNavigate();
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrderByUserId();
                if (response) {
                    console.log("Order la:", response);
                    const convertedOrders = response.map(order => ({
                        ...order,
                        statusDisplay: convertStatus(order.status),
                        paymentStatusDisplay: convertPaymentStatus(order.payment_status)
                    }));
                    setOrders(convertedOrders);
                } else {
                    setError("Không thể lấy dữ liệu đơn hàng.");
                }
            } catch (err) {
                setError("Lỗi khi lấy dữ liệu đơn hàng.");
                console.error("Lỗi fetchOrders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
        updateStatusCounts(); // Update counts when orders change
    }, [orders, searchKeyword, filterStatus]);

    const convertStatus = (status) => {
        switch (status) {
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đang giao';
            case 'delivered':
                return 'Hoàn tất';
            case 'pending':
                return 'Chờ xác nhận';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };
    const convertPaymentStatus = (paymentStatus) => {
        switch (paymentStatus) {
            case 'SUCCESS':
                return 'Thành công';
            case 'PENDING':
                return 'Chưa thanh toán';
            default:
                return paymentStatus;
        }
    };
    const filterOrders = () => {
        let filtered = orders;

        if (filterStatus !== 'Tất cả') {
            filtered = filtered.filter(order => order.statusDisplay === filterStatus);
        }

        if (searchKeyword) {
            filtered = filtered.filter(order =>
                order.order_details.some(detail =>
                    detail.productResponses[0].name.toLowerCase().includes(searchKeyword.toLowerCase())
                )
            );
        }

        setFilteredOrders(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    const handleFilterClick = (status) => {
        setFilterStatus(status);
    };

    const updateStatusCounts = () => {
        const counts = orders.reduce((acc, order) => {
            const status = order.statusDisplay;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        setStatusCounts(counts);
    };

    if (loading) {
        return <div>Đang tải danh sách đơn hàng...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }
    const handleViewProductDetail = (productId) => {
        navigate(`/product/${productId}`);
    };
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Đơn hàng của tôi</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Tìm theo tên đơn, mã đơn hoặc tên sản phẩm"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button style={{ padding: '8px 16px' }}>Tìm</button>
                </div>
            </div>

            <div style={{ display: 'flex', marginBottom: '20px' }}>
                {['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn tất', 'Đã hủy', 'Trả hàng'].map(status => (
                    <button
                        key={status}
                        onClick={() => handleFilterClick(status)}
                        style={{
                            padding: '8px 16px',
                            marginRight: '10px',
                            backgroundColor: filterStatus === status ? '#e0e0e0' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {status}
                        {statusCounts[status] > 0 && status !== 'Tất cả' && (
                            <Badge count={statusCounts[status]} style={{ marginLeft: '5px' }} />
                        )}
                    </button>
                ))}
            </div>

            <Collapse>
                {filteredOrders.map(order => (
                    <Panel header={`Đơn hàng #${order.order_date} - ${order.statusDisplay}`} key={order.order_date}>
                        <p><strong>Ngày đặt:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                        <p><strong>Tổng tiền:</strong> {order.total_money.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        <p><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
                        <p>
                            <strong>Trạng thái thanh toán:</strong>
                            <span
                                style={{
                                    color: order.payment_status === 'SUCCESS' ? 'green' : order.payment_status === 'PENDING' ? 'red' : 'black'
                                }}
                            >
                                {order.paymentStatusDisplay}
                            </span>
                        </p>
                        <p><strong>Phương thức vận chuyển:</strong> {order.shipping_method}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {order.address}</p>
                        <p><strong>Ghi chú:</strong> {order.note || 'Không có ghi chú'}</p>

                        <h4>Chi tiết đơn hàng:</h4>
                        <ul>
                            {order.order_details.map(detail => (
                                <li key={detail.id}>
                                    <strong>Sản phẩm :</strong> {detail.productResponses[0].name},
                                    <strong>Số lượng:</strong> {detail.quantity},
                                    <strong>Giá:</strong> {detail.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })},
                                    <strong>Màu:</strong> {detail.color}
                                    <a
                                        href={`/product/${detail.productId}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleViewProductDetail(detail.productId);
                                        }}
                                        style={{ marginLeft: '10px', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                    >

                                        Xem chi tiết sản phẩm
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
};