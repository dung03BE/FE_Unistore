import { useDispatch, useSelector } from "react-redux";
import CartList from "./CartList";
import { deleteAll } from "../../actions/cart";

function Cart() {
    const cart = useSelector(state => state.cartReducer.cart); // Lấy cart từ state.cartReducer.cart
    const dispatch = useDispatch();

    // Kiểm tra xem cart có phải là một mảng và có dữ liệu hay không
    if (!Array.isArray(cart) || cart.length === 0) {
        return (
            <>
                <div>
                    <CartList />
                </div>
            </>
        );
    }

    const total = cart.reduce((sum, item) => {
        const priceNew = (item.info.price * (100 - item.info.discountPercentage) / 100).toFixed(1);
        return sum + priceNew * item.quantity;
    }, 0);

    const handleDeleteAll = () => {
        dispatch(deleteAll());
    };

    return (
        <>
            <div>
                <CartList />
                {/* Hiển thị thông tin tổng tiền nếu cần */}

            </div>
        </>
    );
}

export default Cart;