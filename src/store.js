import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./reducer"; // Import reducer gốc
import { thunk } from "redux-thunk";

// Cấu hình redux-persist
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["userReducer"],
    // whitelist: ["userReducer", "cartReducer"], // Chỉ lưu userReducer và cartReducer vào localStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Khởi tạo store với persistedReducer
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Bỏ qua cảnh báo khi lưu redux state vào localStorage
        }).concat(thunk),
});

const persistor = persistStore(store);

export { store, persistor };
