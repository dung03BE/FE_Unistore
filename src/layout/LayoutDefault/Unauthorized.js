import React from "react";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.scss";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <h1 className="heading">403 - Không có quyền truy cập</h1>
            <p className="message">Bạn không có quyền truy cập vào trang này.</p>
            <button className="button" onClick={() => navigate("/")}>
                Quay lại Trang chủ
            </button>
        </div>
    );
};

export default Unauthorized;