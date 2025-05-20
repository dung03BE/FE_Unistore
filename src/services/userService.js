import { getAuth, post, putAuth } from "../utils/request";

export const putUserApi = async (userData) => {
    const path = `users`;
    try {
        const result = await putAuth(path, userData);
        console.log("H1:", result);
        return result.result;
    } catch (error) {
        console.error("Lỗi khi update User", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }
};
export const postUserApi = async (userData) => {
    const path = `users/register`;
    try {
        const result = await post(path, userData);
        return result;
    } catch (error) {
        console.error("Lỗi khi create User", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }
};
export const changePasswordApi = async (userData) => {
    const path = `users/changePW`;
    try {
        const result = await putAuth(path, userData);
        return result;
    } catch (error) {
        console.error("Lỗi khi thay đổi password", error);
        if (error.response && error.response.data) {
            throw {
                status: error.response.status,
                data: error.response.data,
            };
        } else {
            throw error;
        }
    }
};
export const forgotPasswordApi = async (email) => {
    const path = `users/forgot?email=${encodeURIComponent(email)}`;
    try {
        const result = await post(path); // Không cần body
        return result;
    } catch (error) {
        console.error("Lỗi khi gửi email đặt lại mật khẩu", error);
        throw error;
    }
};
export const resetPasswordApi = async (token, newPassword) => {
    const path = `users/reset?token=${token}&newPassword=${newPassword}`;
    try {
        const result = await post(path);
        return result;
    } catch (error) {
        console.error("Lỗi khi đặt lại mật khẩu", error);
        throw error; // Re-throw lỗi để component có thể xử lý
    }
};


export const getMyInfor = async () => {
    try {
        const result = await getAuth(`users/myInfo`);
        return result;
    } catch (error) {
        console.error(`Lỗi khi gọi API myfo`, error);
        throw error; // Re-throw lỗi để component xử lý nếu cần
    }
};
