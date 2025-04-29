import { message } from "antd";
import { BASE_URL } from "../config";
const API_DOMAIN = `${BASE_URL}/api/v1/`;

export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path);
    const result = await response.json();
    return result;
}

export const post = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)

    })
    const result = await response.json();
    return result;
}
export const del = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
    });
    const result = await response.json();
    return result;
}
export const path = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    })
    const result = await response.json();
    return result;
}

const getAccessToken = () => {
    return localStorage.getItem("accessToken"); // Thay thế bằng cách lấy token của bạn
};
export const getAuth = async (path) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const result = await response.json();
    return result;
};


export const postAuth = async (path, options) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(options),
    });
    const result = await response.json();
    return result;
};
export const postAuth2 = async (path, formData) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });
    const result = await response.json();
    return result;
};

export const putAuth = async (path, options) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(options),
    });
    const result = await response.json();
    return result;
};
export const deleteAuth = async (path, options) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(options),
    });
    if (response.status === 200) {
        return { success: true }; // Hoặc trả về một giá trị thành công
    }
    const result = await response.json();
    return result;
};

export const patchAuth = async (path, options) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(options),
    });
    if (response.status === 200) {
        return { success: true }; // Hoặc trả về một giá trị thành công
    }
    const result = await response.json();
    return result;
};

export const getAuthv2 = async (path) => {
    const accessToken = getAccessToken();
    const response = await fetch(API_DOMAIN + path, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const result = await response.json();

    // if (!response.ok) {
    //     // Có thể bao gồm message từ server nếu có
    //     const errorMessage = result?.message || result?.Message || 'Lỗi không xác định từ máy chủ';
    //     throw new Error(errorMessage); // ✅ ném lỗi để try...catch bên ngoài xử lý
    // }

    return result;
};