import { getAuth, post } from "../utils/request";
import { removeToken } from "./localStorageService";

export const logOut = () => {
  removeToken();
};

export const getProfile = async () => {
  const path = `users/myInfo`;
  try {
    const result = await getAuth(path);
    return result;
  } catch (error) {
    console.error("Lỗi khi get profile", error);
    throw error;
  }
};
export const login = async (data) => {
  const path = `auth/login`;
  try {
    const result = await post(path, data);
    return result;
  } catch (error) {
    console.error("Lỗi khi login:", error);
    throw error;
  }
};