import { getCart, getCartItem } from "../services/cartService";
export const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
// export const addToCart = (info) => {
//     const uniqueId = `${info.id}-${info.color}`; // Tạo id duy nhất
//     console.log("🛒 Dispatching ADD_TO_CART:", { uniqueId, info });
//     return {
//         type: "ADD_TO_CART",
//         id: uniqueId, // Sử dụng id duy nhất
//         info: info
//     }
// }
export const updateQuantity = (itemId, quantity = 1) => {
    return {
        type: UPDATE_QUANTITY,
        payload: { itemId, quantity },
    };

}
export const deleteItem = (id) => {
    return {
        type: "DELETE_ITEM",
        id: id,

    }
}
export const deleteAll = () => {
    return {
        type: "DELETE_ALL",

    }
}
// actions/cart.js

export const FETCH_CART_SUCCESS = "FETCH_CART_SUCCESS";

// ... các action khác

export const fetchCartSuccess = (cartData) => ({
    type: FETCH_CART_SUCCESS,
    payload: cartData,
});

export const fetchCart = () => {
    return async (dispatch) => {
        try {
            const cartData = await getCartItem(); // Gọi API lấy danh sách cart item
            console.log("Giỏ hàng từ API:", cartData); // Kiểm tra dữ liệu trả về từ API

            // Chuyển đổi dữ liệu API về định dạng reducer
            const formattedCartData = cartData.map(item => ({
                id: item.cartItemId, // Sử dụng cartItemId từ backend làm ID
                info: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.thumbnails && item.product.thumbnails.length > 0 ? item.product.thumbnails[0].imageUrl : null,
                    color: item.color, // Sử dụng trực tiếp item.color
                    discountPercentage: item.product.discount,
                },
                quantity: item.quantity,
            }));

            dispatch(fetchCartSuccess(formattedCartData));
        } catch (error) {
            console.error("Lỗi khi fetch giỏ hàng:", error);
            // Xử lý lỗi nếu cần
        }
    };
};