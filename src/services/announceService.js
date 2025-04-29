import { getAuth, putAuth, postAuth } from "../utils/request";

export const getAnnounceByUserId = async () => {
    try {
        const result = await getAuth(`user-announcements/userId`);
        return result;
    } catch (error) {
        console.error("Lỗi khi lấy thông báo", error);
        throw error;
    }
};

export const updateStatusAnnounceByUseId = async () => {
    try {
        const result = await putAuth(`user-announcements/isRead`);
        return result;
    } catch (error) {
        console.error("Lỗi khi update isRead thông báo", error);
        throw error;
    }
};
export const addAnnounceByUseId = async () => {
    try {
        const result = await postAuth(`user-announcements/assign`);
        return result;
    } catch (error) {
        console.error("Lỗi khi thêm thông báo", error);
        throw error;
    }
};
