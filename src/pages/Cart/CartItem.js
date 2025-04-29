import { useDispatch } from "react-redux";
import { deleteItem, updateQuantity } from "../../actions/cart";
import { useEffect, useRef, useState } from "react";
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

    // useEffect(() => {
    //     if (quantity !== item.quantity) {
    //         clearTimeout(debounceRef.current);
    //         debounceRef.current = setTimeout(() => {
    //             putCartApi(item.info.id, quantity, item.info.color) // Vẫn gọi API để đồng bộ
    //                 .then(() => console.log("Đã cập nhật giỏ hàng (API)"))
    //                 .catch((error) => console.error("Lỗi khi cập nhật giỏ hàng (API):", error));
    //         }, 500);
    //     }
    // }, [quantity, item.id, item.info.color]);
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


    // const handleUp = () => {
    //     const newQuantity = quantity + 1;
    //     setQuantity(newQuantity);
    //     putCartApi(item.info.id, newQuantity, item.info.color)
    //         .then(() => {
    //             console.log("Đã cập nhật giỏ hàng (tăng)");
    //             dispatch(updateQuantity(item.id, newQuantity));
    //             window.location.reload(); // Reload sau khi cập nhật thành công
    //         })
    //         .catch((error) => console.error("Lỗi khi cập nhật giỏ hàng:", error));
    // };

    // const handleDown = () => {
    //     if (quantity > 1) {
    //         const newQuantity = quantity - 1;
    //         setQuantity(newQuantity);
    //         putCartApi(item.info.id, newQuantity, item.info.color)
    //             .then(() => {
    //                 console.log("Đã cập nhật giỏ hàng (giảm)");
    //                 dispatch(updateQuantity(item.id, newQuantity));
    //                 window.location.reload(); // Reload sau khi cập nhật thành công
    //             })
    //             .catch((error) => console.error("Lỗi khi cập nhật giỏ hàng:", error));
    //     }
    // };

    // const handleDelete = async () => {
    //     console.log("Xóa sản phẩm có id:", item);
    //     try {
    //         const result = await deleteCartItem(item.id); // Gọi API xóa với cartItemId
    //         console.log("Kết quả xóa cart item:", result);
    //         dispatch(deleteItem(item.id)); // Cập nhật Redux store sau khi xóa thành công
    //     } catch (error) {
    //         console.error("Lỗi khi xóa cart item:", error);
    //         // Xử lý lỗi nếu cần, ví dụ hiển thị thông báo cho người dùng
    //     }
    // };

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
                <input ref={inputRef}
                    value={quantity}
                    readOnly />
                <button onClick={handleUp}>+</button>
            </div>
            <button className="cart__item-delete" onClick={handleDelete}>Xóa</button>
        </div>
    );
}

export default CartItem;
