import { get, getAuth, postAuth, putAuth } from "../utils/request";

export const getInventoryByProduct = async (productId) => {
    try {
        const result = await get(`inventory/product/${productId}`); // API để lấy thông tin kho theo productId
        return result;
    } catch (error) {
        console.error(`Lỗi khi gọi API getInventoryByProduct với productId: ${productId}`, error);
        throw error; // Re-throw lỗi để component xử lý nếu cần
    }
};

export const getTotalInventoryByProduct = async (productId) => {
    try {
        const result = await getAuth(`total-inventory/product/${productId}`); // API để lấy thông tin kho theo productId
        return result;
    } catch (error) {
        console.error(`Lỗi khi gọi API getInventoryByProduct với productId: ${productId}`, error);
        throw error; // Re-throw lỗi để component xử lý nếu cần
    }
};
export const getAllInventory = async () => {
    try {
        const result = await getAuth(`inventory`); // API để lấy thông tin kho theo productId
        return result;
    } catch (error) {
        console.error(`Lỗi khi gọi API `, error);
        throw error; // Re-throw lỗi để component xử lý nếu cần
    }
};
export const updateInventory = async (id, data) => {
    const path = `inventory/${id}`;
    try {
        const result = await putAuth(path, data);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi cập nhật inventory:", error);
        throw error;
    }
};
export const createInventory = async (inventory) => {
    const path = `inventory`;
    try {
        const result = await postAuth(path, inventory);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi tạo mới inventory:", error);
        throw error;
    }
};