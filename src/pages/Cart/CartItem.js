import { useDispatch } from "react-redux";
import { deleteItem, updateQuantity } from "../../actions/cart";
import { useRef, useState } from "react";
import { deleteCartItem, putCartApi } from "../../services/cartService";
import { BASE_URL } from "../../config";
function CartItem({ item }) {
    const inputRef = useRef();
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(item.quantity);
    // Debounce timeout để gọi API
    const debounceRef = useRef(null);
    console.log("item", item);
    // Cập nhật API sau 500ms nếu có thay đổi số lượng
    const handleUp = () => {
        updateQuantityAndApi(quantity + 1); // Cập nhật số lượng và gọi API
    };

    const handleDown = () => {
        if (quantity > 1) {
            updateQuantityAndApi(quantity - 1);
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value); // Lấy giá trị nhập vào và chuyển đổi sang số nguyên
        if (!isNaN(value) && value >= 1) { // Đảm bảo là số hợp lệ và lớn hơn hoặc bằng 1
            updateQuantityAndApi(value);
        } else if (e.target.value === "") {
            // Cho phép xóa trống để người dùng nhập số mới
            setQuantity("");
            clearTimeout(debounceRef.current); // Xóa debounce nếu đang gõ
        }
    };

    const handleInputBlur = () => {
        // Khi người dùng rời khỏi input, nếu giá trị rỗng hoặc không hợp lệ, đặt lại về 1
        if (quantity === "" || isNaN(quantity) || quantity < 1) {
            updateQuantityAndApi(1);
        }
    };
    const updateQuantityAndApi = (newQuantity) => {
        setQuantity(newQuantity);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            putCartApi(item.info.id, newQuantity, item.info.color)
                .then(() => console.log("Đã cập nhật giỏ hàng (API)"))
                .catch((error) => console.error("Lỗi khi cập nhật giỏ hàng (API):", error));
        }, 500);
        dispatch(updateQuantity(item.id, newQuantity)); // Cập nhật Redux ngay lập tức
    };
    const handleDelete = async () => {
        console.log("Xóa sản phẩm có id:", item);
        try {
            const result = await deleteCartItem(item.id);
            console.log("Kết quả xóa cart item:", result);
            dispatch(deleteItem(item.id));

        } catch (error) {
            console.error("Lỗi khi xóa cart item:", error);
        }
    };


    const imageUrl = `${item.info.image}`; // Xây dựng URL đầy đủ

    return (
        <div className="cart__item">
            <div className="cart__item-image">
                <img src={imageUrl} alt={item.info.name} />
            </div>
            <div className="cart__item-content">
                <h4 className="cart__item-title">{item.info.name}</h4>
                <div className="cart__item-color">Màu: {item.info.color}</div>
            </div>
            <div className="cart__item-price">
                <div className="cart__item-price-new">
                    {((item.info.price * (100 - (item.info.discountPercentage || 0))) / 100).toFixed(2)}VNĐ
                </div>
                <div className="cart__item-price-old">{item.info.price}VNĐ</div>
            </div>
            <div className="cart__item-quantity">
                <button onClick={handleDown}>-</button>
                <input
                    ref={inputRef}
                    value={quantity}
                    onChange={handleInputChange} // Xử lý sự kiện khi nhập liệu
                    onBlur={handleInputBlur} // Xử lý khi rời khỏi input
                    type="number" // Đặt type là number để có các nút tăng giảm mặc định trên trình duyệt (tùy chọn)
                    min="1" // Đảm bảo số lượng tối thiểu là 1
                />
                <button onClick={handleUp}>+</button>
            </div>
            <button className="cart__item-delete" onClick={handleDelete}>Xóa</button>
        </div>
    );
}

export default CartItem;
