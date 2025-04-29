import { get, getAuth, putAuth } from "../utils/request";

export const getOrderList = async (fullName, totalMoney, active) => {
    let url = `orders`;
    let params = new URLSearchParams(); // Sử dụng URLSearchParams

    if (fullName !== undefined && fullName !== null && fullName !== '') {
        params.append('fullName', fullName);
    }

    if (totalMoney !== undefined && totalMoney !== null && totalMoney !== '') {
        params.append('totalMoney', totalMoney);
    }

    if (active !== undefined && active !== null) {
        params.append('active', active);
    }

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    try {
        const result = await getAuth(url);
        return result.result;
    } catch (error) {
        console.error("Lỗi khi khi lấy order", error);
        throw error;
    }
};

export const putStatusOrder = async (id, status) => {
    const path = `orders/checkout/${id}`;
    try {
        const result = await putAuth(path, { status });
        return result;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }
};

export const getOrderById = async (orderId) => {
    const path = `orders/${orderId}`;
    try {
        const data = await get(path);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        throw error;
    }
};