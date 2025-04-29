import { useDispatch, useSelector } from "react-redux";
import "./CartItem.scss";
import CartItem from "./CartItem";
import { deleteAll, fetchCart } from "../../actions/cart";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { DeleteAllCartApi } from "../../services/cartService";

function CartList() {
    const cart = useSelector((state) => state.cartReducer.cart); // Lấy cart từ state.cartReducer.cart
    const dispatch = useDispatch();
    // const userId = useSelector((state) => state.userReducer.userDetails?.id);
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    // Kiểm tra xem cart có phải là một mảng và có dữ liệu hay không
    if (!Array.isArray(cart) || cart.length === 0) {
        return (
            <div className="cart">
                <div className="cart__container">
                    <div className="cart__left">
                        <div className="cart__header">
                            <h2>Giỏ hàng</h2>
                            <button className="cart__clear-btn" onClick={() => dispatch(deleteAll())}>
                                Xóa tất cả
                            </button>
                        </div>
                        <div className="cart__items">
                            <div>Giỏ hàng trống</div>
                        </div>
                    </div>
                    <div className="cart__right">
                        <div className="cart__summary">
                            <h3>Thông tin đơn hàng</h3>
                            <div className="cart__summary-row">
                                <span>Tổng tiền</span>
                                <span className="cart__summary-value">0.00VNĐ</span>
                            </div>
                            <div className="cart__summary-row">
                                <span>Tổng khuyến mãi</span>
                                <span className="cart__summary-value">0.00VNĐ</span>
                            </div>
                            <div className="cart__summary-row cart__summary-total">
                                <span>Cần thanh toán</span>
                                <span className="cart__summary-value">0.00VNĐ</span>
                            </div>
                            <button className="cart__checkout-btn">Xác nhận đơn</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Tính toán tổng tiền, tổng khuyến mãi và cần thanh toán
    const total = cart.reduce((acc, item) => acc + item.info.price * item.quantity, 0);

    const discount = cart.reduce(
        (acc, item) => acc + (item.info.price * (item.info.discountPercentage || 0) / 100) * item.quantity,
        0
    );
    const finalTotal = total - discount;

    const handleDeleteAll = async () => {
        try {
            await DeleteAllCartApi(); // Gọi API xóa giỏ hàng
            dispatch(deleteAll()); // Dispatch action để cập nhật Redux store
        } catch (error) {
            console.error("Lỗi xóa giỏ hàng:", error);
            // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
        }
    };
    console.log("cart ne:", cart);

    return (
        <div className="cart">
            <div className="cart__container">
                <div className="cart__left">
                    <div className="cart__header">
                        <h2>Giỏ hàng</h2>
                        <button className="cart__clear-btn" onClick={handleDeleteAll}>
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="cart__items">
                        {cart.map((item) => (
                            <CartItem item={item} key={item.id} />
                        ))}
                    </div>
                </div>
                <div className="cart__right">
                    <div className="cart__summary">
                        <h3>Thông tin đơn hàng</h3>
                        <div className="cart__summary-row">
                            <span>Tổng tiền</span>
                            <span className="cart__summary-value">{total.toFixed(2)}VNĐ</span>
                        </div>
                        <div className="cart__summary-row">
                            <span>Tổng khuyến mãi</span>
                            <span className="cart__summary-value">{discount.toFixed(2)}VNĐ</span>
                        </div>
                        <div className="cart__summary-row cart__summary-total">
                            <span>Cần thanh toán</span>
                            <span className="cart__summary-value">{finalTotal.toFixed(2)}VNĐ</span>
                        </div>
                        <Link to={{ pathname: '/payment', state: { cart: cart } }}>
                            <button className="cart__checkout-btn">Xác nhận đơn</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartList;