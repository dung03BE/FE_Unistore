import { message } from "antd";
import { deleteAuth, getAuth, getAuthv2, postAuth, putAuth } from "../utils/request";

export const payMent = async (orderData) => {
    const path = `orders/checkout`;
    try {
        const result = await postAuth(path, orderData);
        return result;
    } catch (error) {
        console.error("Lỗi khi thanh toán:", error);
        throw error;
    }
};
export const payMentVnpay = async (orderData) => {
    const path = `orders/checkoutVnpay`;
    try {
        const result = await postAuth(path, orderData);
        console.log("Kết quả thanh toán VNPAY:", result);
        // Kiểm tra nếu code là 1000 (thành công) và trả về url
        if (result?.code === 1000 && result?.result) {
            return result.result;
        }
        // Nếu không phải code 1000 hoặc không có result, coi như có lỗi từ API
        return {
            code: result?.code || -1, // Giữ lại code lỗi từ API nếu có
            message: result?.message || "Lỗi không xác định từ API thanh toán VNPAY.",
        };
    } catch (error) {
        console.error("Lỗi khi thanh toán:", error);
        // Trả về lỗi từ request nếu có, hoặc lỗi mặc định
        return error.response?.data || {
            code: -1,
            message: "Có lỗi xảy ra khi gọi thanh toán qua VNPAY.",
        };
    }
};

export const getOrderByUserId = async () => {
    const path = `orders/user`;
    try {
        const result = await getAuth(path);
        return result.result;
    } catch (error) {
        console.error("Lỗi khi get Order", error);
        throw error;
    }
};

export const getCouponByUser = async (code) => {
    const path = `coupon/code/${code}`;
    try {
        const result = await getAuthv2(path);
        if (result?.code === 1016) {
            message.error("Bạn đã áp dụng mã giảm giá này rồi!");
            return null;
        }
        if (result?.code === 1018) {
            message.error(result.message);
            return null;
        }
        return result || null;

    } catch (error) {
        console.error("Lỗi khi get coupon", error);
        throw error;
    }
};

export const getAllCoupon = async () => {
    try {
        const result = await getAuth(`coupon`); // API để lấy thông tin kho theo productId
        return result;
    } catch (error) {
        console.error(`Lỗi khi gọi API `, error);
        throw error; // Re-throw lỗi để component xử lý nếu cần
    }
};

export const createCoupon = async (data) => {
    const path = `coupon/addNew`;
    try {
        const result = await postAuth(path, data);
        return result;
    } catch (error) {
        console.error("Lỗi khi tạo coupon:", error);
        throw error;
    }
};

export const deleteCoupon = async ({ id }) => {
    const path = `coupon/${id}`;
    try {
        const result = await deleteAuth(path);
        return result;
    } catch (error) {
        console.error("Lỗi khi xóa coupon:", error);
        throw error;
    }
};