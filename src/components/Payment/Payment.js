import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getCouponByUser, payMent, payMentVnpay } from "../../services/paymentService"; // Import cả hai API
import "./Payment.scss";
import { message, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";
function Payment() {
    const userDetails = useSelector((state) => state.userReducer.userDetails);
    const cart = useSelector((state) => state.cartReducer.cart);
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        note: '',
        shippingMethod: 'express',
        paymentMethod: 'cod', // Giá trị mặc định
        email: '',
    });

    const [errors, setErrors] = useState({
        fullName: false,
        phoneNumber: false,
        address: false,
        email: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: false });
        }
    };

    const validateForm = () => {
        const phoneRegex = /^\d{10}$/; // Kiểm tra 10 chữ số
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const newErrors = {
            fullName: !formData.fullName.trim(),
            phoneNumber: !formData.phoneNumber.trim() || !phoneRegex.test(formData.phoneNumber),
            address: !formData.address.trim(),
            email: !formData.email.trim() || !emailRegex.test(formData.email),
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userDetails?.id) {
            message.error('Bạn cần đăng nhập để thanh toán.');
            return;
        }

        if (!validateForm()) {
            notification.warning({
                message: 'Thông tin không đầy đủ',
                description: 'Vui lòng điền đầy đủ và đúng định dạng các thông tin bắt buộc.',
                duration: 3,
            });
            return;
        }

        const orderData = {
            ...formData,
            userId: userDetails.id,
            cartItems: cart.map(item => ({
                productId: item.info.id,
                quantity: item.quantity,
                color: item.info.color,
            })),
            totalAmount: finalTotalAfterDiscount, // Thêm tổng tiền vào orderData
            couponCode: coupon?.code,
        };

        try {
            let response;
            if (formData.paymentMethod === 'cod') {
                response = await payMent(orderData);
                console.log("responseCOD", response);
                if (response.code === 1000) { // Kiểm tra một thuộc tính thành công giả định trong response
                    notification.success({
                        message: 'Đặt hàng thành công',
                        description: response.message || 'Đơn hàng của bạn đã được ghi nhận. Vui lòng check mail!', // Sử dụng message từ response nếu có
                        duration: 4,
                    });
                    setTimeout(() => {
                        navigate('/'); // Chuyển hướng về trang home
                    }, 2000);
                } else {
                    console.log("Lỗi từ payMent API:", response);
                    if (response?.code === 1016) {
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message,
                        });
                    }
                    else if (response?.code === 1017) { // Thêm một fallback để hiển thị lỗi nếu không phải code 1016
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message || 'Mã giảm giá đã quá người sử dụng!',
                        });
                    } else if (response) { // Thêm một fallback để hiển thị lỗi nếu không phải code 1016
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message || response.Message || 'Đã có lỗi xảy ra khi đặt hàng.',
                        });
                    }
                }
            } else if (formData.paymentMethod === 'vnpay') {

                response = await payMentVnpay(orderData);
                console.log("responseVNPAY", response);
                // Xử lý logic sau khi gọi API VNPAY (thường là redirect sang trang thanh toán VNPAY)
                if (response?.paymentUrl) {
                    window.location.href = response.paymentUrl; // Redirect sang trang VNPAY
                    return; // Dừng hàm ở đây để không chạy các notification thành công khác
                } else {
                    // notification.error({
                    //     message: 'Lỗi khởi tạo thanh toán VNPAY',
                    //     description: 'Có lỗi xảy ra khi chuẩn bị thanh toán qua VNPAY. Vui lòng thử lại sau.',
                    // });
                    // return;
                    if (response?.code === 1016) {
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message,
                        });
                    }
                    else if (response?.code === 1017) { // Thêm một fallback để hiển thị lỗi nếu không phải code 1016
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message || 'Mã giảm giá đã quá người sử dụng!',
                        });
                    } else if (response) { // Thêm một fallback để hiển thị lỗi nếu không phải code 1016
                        notification.error({
                            message: 'Lỗi đặt hàng',
                            description: response.message || response.Message || 'Đã có lỗi xảy ra khi đặt hàng.',
                        });
                    }
                }
            } else {
                // Xử lý các phương thức thanh toán khác (nếu có)
                notification.warning({
                    message: 'Phương thức thanh toán chưa được hỗ trợ',
                    description: `Phương thức thanh toán ${formData.paymentMethod} hiện chưa được hỗ trợ.`,
                });
                return;
            }

            // Nếu là COD và gọi API thành công, các notification và navigate đã được xử lý ở trên

        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            notification.error({
                message: 'Lỗi đặt hàng',
                description: 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại sau.',
            });

        }
    };

    const total = cart.reduce((acc, item) => acc + item.info.price * item.quantity, 0);
    const discount = cart.reduce(
        (acc, item) => acc + (item.info.price * (item.info.discountPercentage || 0) / 100) * item.quantity,
        0
    );
    // const finalTotal = total - discount;
    // console.log("user:" + userDetails);
    const calculateDiscountedPrice = () => {
        if (coupon && coupon.status === 'active') {
            if (coupon.discountType === 'percentage') {
                return total * coupon.discountValue;
            } else if (coupon.discountType === 'fixed') {
                return coupon.discountValue;
            }
        }
        return 0;
    };

    const discountedPrice = calculateDiscountedPrice();
    const finalTotalAfterDiscount = total - discount - discountedPrice;

    const handleCouponCodeChange = (e) => {

        setCouponCode(e.target.value);
        setCoupon(null); // Reset coupon khi người dùng nhập lại mã
        setCouponError('');
    };
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Vui lòng nhập mã giảm giá.');
            return;
        }
        try {
            const response = await getCouponByUser(couponCode);
            if (response !== null) {
                setCoupon(response);
                message.success(`Áp dụng mã giảm giá "${couponCode}" thành công!`);
                console.log("response", response);
            } else {
                setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
                setCoupon(null);
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng coupon:', error);
            setCouponError(error.message || 'Có lỗi xảy ra khi áp dụng mã giảm giá.');
            setCoupon(null);
        }
    };
    return (
        <>
            <h2>Thông tin thanh toán</h2>
            <div className="payment-container">
                <div className="payment-content">
                    <form onSubmit={handleSubmit}>
                        <div className={`form-group ${errors.fullName ? 'error' : ''}`}>
                            <label htmlFor="fullName">Họ và tên: <span className="required">*</span></label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'error-input' : ''}
                            />
                            {errors.fullName && <div className="error-text">Vui lòng nhập họ và tên</div>}
                        </div>
                        <div className={`form-group ${errors.phoneNumber ? 'error' : ''}`}>
                            <label htmlFor="phoneNumber">Số điện thoại: <span className="required">*</span></label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className={errors.phoneNumber ? 'error-input' : ''}
                            />
                            {errors.phoneNumber && <div className="error-text">Vui lòng nhập số điện thoại hợp lệ (10 chữ số)</div>}
                        </div>
                        <div className={`form-group ${errors.address ? 'error' : ''}`}>
                            <label htmlFor="address">Địa chỉ: <span className="required">*</span></label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={errors.address ? 'error-input' : ''}
                            />
                            {errors.address && <div className="error-text">Vui lòng nhập địa chỉ</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="note">Ghi chú:</label>
                            <textarea id="note" name="note" value={formData.note} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="shippingMethod">Phương thức vận chuyển:</label>
                            <select id="shippingMethod" name="shippingMethod" value={formData.shippingMethod} onChange={handleChange}>
                                <option value="express">Nhanh</option>
                                <option value="standard">Tiêu chuẩn</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="paymentMethod">Phương thức thanh toán:</label>
                            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                {/* <option value="paypal">PayPal</option>
                                <option value="creditcard">Thẻ tín dụng</option> */}
                                <option value="vnpay">VNPAY</option>
                            </select>
                        </div>
                        <div className={`form-group ${errors.email ? 'error' : ''}`}>
                            <label htmlFor="email">Email: <span className="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error-input' : ''}
                            />
                            {errors.email && <div className="error-text">Vui lòng nhập email hợp lệ</div>}
                        </div>
                        <div className="form-note">
                            <p><span className="required">*</span> Thông tin bắt buộc</p>
                        </div>
                        <button type="submit">Xác nhận thanh toán</button>
                    </form>
                    <div className="danhsachSP">
                        <h3>Thông tin đơn hàng:</h3>
                        {cart.map((item) => {
                            const imageUrl = `${item.info.image}`;
                            return (
                                <div key={item.id} className="product-item">
                                    <img src={imageUrl} alt={item.info.name} className="product-image" />
                                    <div className="product-details">
                                        <div className="product-name">{item.info.name} - {item.info.color}</div>
                                        <div className="product-price">Giá: {item.info.price.toLocaleString()} VNĐ</div>
                                        <div className="product-quantity">Số lượng: {item.quantity}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="cart__right">
                            <div className="cart__summary">
                                <div className="cart__summary-row">
                                    <span>Tổng tiền</span>
                                    <span className="cart__summary-value">{total.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="coupon">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giảm giá"
                                        value={couponCode}
                                        onChange={handleCouponCodeChange}
                                    />
                                    <button type="button" className="apply-coupon" onClick={handleApplyCoupon}>
                                        Áp dụng
                                    </button>
                                    {couponError && <div className="error-text">{couponError}</div>}
                                </div>
                                <div className="cart__summary-row">
                                    <span>Tổng khuyến mãi sản phẩm</span>
                                    <span className="cart__summary-value">{discount.toLocaleString()} VNĐ</span>
                                </div>
                                {coupon && coupon.status === 'active' && (
                                    <div className="cart__summary-row">
                                        <span>Giảm giá từ mã</span>
                                        <span className="cart__summary-value">-{discountedPrice.toLocaleString()} VNĐ</span>
                                    </div>
                                )}
                                <div className="cart__summary-row cart__summary-total">
                                    <span>Cần thanh toán</span>
                                    <span className="cart__summary-value">{finalTotalAfterDiscount.toLocaleString()} VNĐ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Payment;