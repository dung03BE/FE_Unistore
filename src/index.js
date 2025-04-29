import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./store"; // Import store từ Redux Persist
import { PersistGate } from "redux-persist/integration/react";
// import "bootstrap/dist/css/bootstrap.min.css";

const loadCartData = () => {
  const cartData = localStorage.getItem("persist:root");
  if (cartData) {
    try {
      const parsedData = JSON.parse(cartData);
      if (parsedData.cartReducer && typeof parsedData.cartReducer === "string") {
        const cartReducer = JSON.parse(parsedData.cartReducer);
        console.log("✅ Dữ liệu giỏ hàng từ Redux Persist:", cartReducer);
      } else {
        console.warn("⚠️ cartReducer không hợp lệ hoặc không phải là chuỗi JSON.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi parse JSON từ localStorage:", error);
    }
  } else {
    console.warn("⚠️ Không tìm thấy persist:root trong localStorage.");
  }
};

// Gọi function để kiểm tra dữ liệu giỏ hàng khi khởi chạy ứng dụng
loadCartData();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);

reportWebVitals();
