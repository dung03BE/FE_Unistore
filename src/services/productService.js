import { message } from "antd";
import { del, deleteAuth, get, patchAuth, path, post, postAuth, postAuth2, putAuth } from "../utils/request";

export const getProductList = async (page = 0, size = 8, minPrice, maxPrice, search) => {
    let url = `products?page=${page}&size=${size}`;

    if (minPrice !== undefined && minPrice !== null) {
        url += `&minPrice=${minPrice}`;
    }

    if (maxPrice !== undefined && maxPrice !== null) {
        url += `&maxPrice=${maxPrice}`;
    }

    if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`;
    }
    try {
        const result = await get(url);
        return result.result;
    }
    catch (error) {
        console.error("Lỗi khi lấy dữ liệu", error);
        throw error;
    }
};
export const getProductListByCategoryId = async (page = 0, size = 8, categoryId) => {
    let url = `products/getAllBy-category/${categoryId}?page=${page}&size=${size}`;
    const result = await get(url);
    return result.result;
};
export const getProductById = async (id) => {
    const result = await get(`products/${id}`); // API để lấy chi tiết sản phẩm theo ID
    console.log("ProductId:", result.result);
    return result.result;
};
//compare
export const compare = async (ids) => {
    const queryString = ids.join(","); // Chuyển mảng ID thành chuỗi "1,2,3"
    const result = await get(`products/compare?ids=${queryString}`); // Gọi API với query param
    console.log("Compare:", result.result);
    return result.result;
};
export const getProductByName = async (name) => {
    const result = await get(`products/name/${name}`); // API để lấy chi tiết sản phẩm theo ID
    console.log("ProductName:", result.result);
    return result.result;
};
export const getAdList = async () => {
    // Mô phỏng gọi API trả về danh sách quảng cáo
    return [
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_bd59d1c143.png",
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_3809fd8db1.png",
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_9ed505bfa4.png",

    ];
};

export const createProduct = async (product) => {
    const path = `products`;
    try {
        const result = await postAuth(path, product);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi tạo mới product:", error);
        throw error;
    }
};
export const createProductImages = async (product) => {
    const path = `products/uploads`;
    try {
        const result = await postAuth(path, product);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi tạo mới product:", error);
        throw error;
    }
};
export const uploadImages = async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
        console.log("Chạy vào đây");
        formData.append("files", file.originFileObj);
    });
    const path = `products/uploads/${id}`;
    try {
        const result = await postAuth2(path, formData);
        return result;
    } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
    }
};

export const deleteProduct = async (id) => {
    const path = `products/${id}`;
    try {
        const result = await deleteAuth(path);

        return result;
    } catch (error) {
        console.error("Lỗi khi khi xóa mới product:", error);
        throw error;
    }
};
export const updateProduct = async (id, productData) => {
    const path = `products/${id}`;
    try {
        const result = await putAuth(path, productData);
        return result;
    } catch (error) {
        console.error("Lỗi khi khi cập nhật product:", error);
        throw error;
    }
};

export const getCommentsByProductId = async (productId) => {
    const path = `comments/${productId}`;
    try {
        const data = await get(path);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
        throw error;
    }
};