import { del, deleteAuth, get, getAuth, path, post, postAuth, putAuth } from "../utils/request";
export const getCart = async () => {
    const result = await getAuth(`carts/users/cart`); // API để lấy cartcart
    return result;
};
export const getCartItem = async () => {
    const result = await getAuth(`carts/cart`); // API để lấy cartcart
    return result;
};

export const addToCartAPI = async (productId, quantity, color) => {
    const path = `carts/products/${productId}/quantity/${quantity}?color=${color}`;
    try {
        const result = await postAuth(path, {}); // Body rỗng vì không có body request
        if (result.status === 500) {

            return "LoginValid";
        }
        return result;
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }

};

export const putCartApi = async (productId, quantity, color) => {
    const path = `carts/products/${productId}/quantity?quantityChange=${quantity}&color=${color}`;
    try {
        const result = await putAuth(path, {}); // Body rỗng vì không có body request
        return result;
    } catch (error) {
        console.error("Lỗi khi sửa vào giỏ hàng:", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }
};

export const DeleteAllCartApi = async () => {
    const path = `carts`; // Thêm userId vào path
    try {
        const result = await deleteAuth(path, {});
        return result;
    } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error);
        throw error;
    }
};

export const deleteCartItem = async (cartItemId) => {
    const path = `carts/cartItemId/${cartItemId}`;
    try {
        const result = await deleteAuth(path, {});
        return result;
    } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error);
        throw error;
    }
};