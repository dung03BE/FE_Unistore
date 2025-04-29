import { getAuth, postAuth, putAuth } from "../utils/request";

export const createRecycleRequest = async (data) => {
    const path = `recycle`;
    try {
        const result = await postAuth(path, data);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi tạo mới request:", error);
        throw error;
    }
};

export const getRecycleByUserId = async () => {
    try {
        const result = await getAuth(`recycle/userId`);
        return result.result;
    } catch (error) {
        console.error("Lỗi khi lấy request:", error);
        throw error;
    }
};

export const getAllRecycleRequest = async () => {
    try {
        const result = await getAuth(`recycle`);
        return result.result;
    } catch (error) {
        console.error("Bạn không có quyền truy cập", error);
        throw error;
    }
};
export const putStatusRecycleRq = async (id, status) => {
    try {
        const result = await putAuth(`recycle/${id}`, status);
        return result.result;
    } catch (error) {
        console.error("Bạn không có quyền thay đổi status", error);
        throw error;
    }
};