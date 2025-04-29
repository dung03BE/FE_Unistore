import { message } from "antd";
import { getAuth } from "../utils/request";

export const getOverview = async () => {
    try {
        const result = await getAuth(`dashboard/overview`);
        if (result?.code === 9999) {
            message.error("Bạn không có quyền truy cập Trang quản trị!");
            return null;
        }
        console.log("result1", result);
        return result || null;
    } catch (error) {
        handleApiError(error);
        return [];
    }
};

export const getMonthlyRevenue = async () => {
    try {
        const result = await getAuth(`dashboard/monthly-revenue`);
        if (result?.code === 9999) {
            return [];
        }
        console.log("result22", result);
        return result || [];
    } catch (error) {
        handleApiError(error);
        return [];
    }
};

export const getTopProductType = async () => {
    try {
        const result = await getAuth(`dashboard/top-product-types`);
        if (result?.code === 9999) {
            return [];
        }
        console.log("result33", result);
        return result || [];
    } catch (error) {
        handleApiError(error);
        return [];
    }
};

export const getTopSellingProducts = async () => {
    try {
        const result = await getAuth(`dashboard/top-selling-products`);
        if (result?.code === 9999) {

            return [];
        }
        console.log("result4", result);
        return result || [];
    } catch (error) {
        handleApiError(error);
        return [];
    }
};

// Hàm xử lý lỗi chung để tránh lặp code
const handleApiError = (error) => {
    if (error.response) {
        console.error("Lỗi API:", error.response.data);
        message.error(error.response.data.message || "Lỗi từ server!");
    } else if (error.request) {
        console.error("Lỗi kết nối:", error.request);
        message.error("Không thể kết nối đến server!");
    } else {
        console.error("Lỗi không xác định:", error.message);
        message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    }
};
