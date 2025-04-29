import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentResult.scss'; // Bạn sẽ cần tạo file CSS này
import { getOrderById } from '../../services/orderService';

function PaymentResult() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const message = searchParams.get("message"); // Lấy thêm thông tin về lỗi

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                if (status === 'success' || status === 'failed' || status === 'cancelled' || status === 'error') {
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            try {
                const data = await getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Error fetching order:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, status]);
    const renderOrderDetails = () => {
        if (!order || !order.order_details) {
            return null;
        }
        return order.order_details.map((item) => (
            <div key={item.id} className="order-item">
                <h4>Sản phẩm ID: {item.productId}</h4>
                <div className="order-item-details">
                    <p>Số lượng: <strong>{item.quantity}</strong></p>
                    <p>Màu sắc: <strong>{item.color}</strong></p>
                    <p>Giá: <strong>{item.price.toLocaleString()}₫</strong></p>
                </div>
            </div>
        ));
    };

    const renderOrderInfo = () => {
        if (!order) {
            return null;
        }
        return (
            <div className="order-info">
                <h3>Thông tin đơn hàng</h3>
                <div className="order-info-grid">
                    <div className="order-info-column">
                        <p>Mã đơn hàng: <strong>{order.id}</strong></p>
                        <p>Tên người nhận: <strong>{order.fullname}</strong></p>
                        <p>Số điện thoại: <strong>{order.phoneNumber}</strong></p>
                        <p>Địa chỉ: <strong>{order.address}</strong></p>
                    </div>
                    <div className="order-info-column">
                        <p>Ngày đặt hàng: <strong>{new Date(order.order_date).toLocaleString()}</strong></p>
                        <p>Trạng thái: <strong>{"Đang xử lý"}</strong></p>
                        <p>Phương thức thanh toán: <strong>{order.payment_method}</strong></p>
                        <p>Phương thức giao hàng: <strong>{order.shipping_method}</strong></p>
                    </div>
                </div>
                <div className="order-total">
                    <p>Tổng tiền: <strong className="total-amount">{order.total_money.toLocaleString()}₫</strong></p>
                </div>
            </div>
        );
    };

    const renderSuccess = () => {
        if (isLoading) {
            return (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-message">
                    <h2>Đã có lỗi xảy ra</h2>
                    <p>{error}</p>
                </div>
            );
        }

        return (
            <div>
                <div className="success-header">
                    <div className="success-icon">✓</div>
                    <h2>Thanh toán thành công!</h2>
                    <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức.</p>
                </div>

                {order && renderOrderInfo()}

                {order && order.order_details && order.order_details.length > 0 && (
                    <div className="order-details-section">
                        <h3>Chi tiết sản phẩm</h3>
                        <div className="order-details-list">
                            {renderOrderDetails()}
                        </div>
                    </div>
                )}
                <div>Hãy truy cập mục <Link to="/profile">"Đơn hàng của tôi"</Link> để xem chi tiết đơn hàng!</div>
            </div>
        );
    };

    const renderFailed = () => (
        <div className="failed-payment">
            <div className="failed-icon">✕</div>
            <h2>Thanh toán thất bại</h2>
            <p>Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.</p>
            {message && <p className="error-details">Lỗi chi tiết: {message.replace(/_/g, ' ')}</p>} {/* Hiển thị thông báo lỗi nếu có */}
        </div>
    );

    const renderCancelled = () => (
        <div className="cancelled-payment">
            <div className="cancelled-icon">⚠️</div>
            <h2>Thanh toán bị hủy</h2>
            <p>Giao dịch thanh toán đã bị hủy.</p>
            {message && <p className="info-details">Thông tin thêm: {message.replace(/_/g, ' ')}</p>} {/* Hiển thị thông báo nếu có */}
        </div>
    );

    const renderUnknown = () => (
        <div className="unknown-payment">
            <div className="unknown-icon">?</div>
            <h2>Trạng thái không xác định</h2>
            <p>Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra lại sau.</p>
        </div>
    );

    const renderError = () => (
        <div className="error-payment">
            <div className="error-icon">❗</div>
            <h2>Lỗi hệ thống</h2>
            <p>Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.</p>
            {message && <p className="error-details">Chi tiết lỗi: {message.replace(/_/g, ' ')}</p>} {/* Hiển thị thông báo lỗi nếu có */}
        </div>
    );

    return (
        <div className="payment-result-container">
            {isLoading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Đang xử lý kết quả thanh toán...</p>
                </div>
            ) : status === 'success' ? (
                renderSuccess()
            ) : status === 'failed' ? (
                renderFailed()
            ) : status === 'cancelled' ? (
                renderCancelled()
            ) : status === 'error' ? (
                renderError()
            ) : (
                renderUnknown()
            )}

            <div className="home-link">
                <Link to="/">Quay về trang chủ</Link>
            </div>
        </div>
    );
}

export default PaymentResult;