import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { compare, getProductByName } from "../../services/productService";
import { removeAllFromCompare } from "../../actions/compare";
import { persistStore } from "redux-persist";
import { store } from "../../store"; // Import store nếu bạn dùng redux-persist
import styles from "./ComparePage.module.scss"; // Import file SCSS module
import { Image, message } from "antd";
import { BASE_URL } from "../../config";
function ComparePage() {
    const dispatch = useDispatch();
    const selectedProductId = useSelector((state) => state.compareReducer.compareList);
    const [searchTerm, setSearchTerm] = useState("");
    const [secondProduct, setSecondProduct] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const API_BASE_URL = `${BASE_URL}`; // Define your API base URL

    console.log("SelectedProductId:", selectedProductId);

    const handleSearch = async () => {
        if (!searchTerm) return;
        const product = await getProductByName(searchTerm);
        if (product) {
            setSecondProduct(product);
        } else {
            message.warning("Không tìm thấy sản phẩm nào.");
        }
    };

    const handleCompare = async () => {
        if (!selectedProductId || selectedProductId.length === 0 || !secondProduct) return;
        const result = await compare([selectedProductId[0], secondProduct.id]);
        setComparisonResult(result);
    };

    const productFieldsToCompare = [
        { key: "name", label: "Tên sản phẩm" },
        { key: "price", label: "Giá" },
        { key: "description", label: "Mô tả" },
        { key: "brand", label: "Thương hiệu" },
        { key: "model", label: "Mẫu mã" },
        { key: "details.screen_size", label: "Kích thước màn hình" },
        { key: "details.resolution", label: "Độ phân giải" },
        { key: "details.processor", label: "Bộ xử lý" },
        { key: "details.ram", label: "RAM" },
        { key: "details.storage", label: "Bộ nhớ trong" },
        { key: "details.battery", label: "Pin" },
        { key: "details.camera", label: "Camera" },
        { key: "details.os", label: "Hệ điều hành" },
        { key: "details.weight", label: "Khối lượng" },
        { key: "details.dimensions", label: "Kích thước" },
        { key: "details.sim", label: "SIM" },
        { key: "details.network", label: "Mạng" },
        { key: "available", label: "Tình trạng" },
        { key: "quantity", label: "Số lượng" },
        // Thêm các trường khác bạn muốn so sánh
    ];

    const getNestedValue = (obj, path) => {
        if (!obj || !path) return '';
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length; i++) {
            if (!current || !current.hasOwnProperty(keys[i])) {
                return '';
            }
            current = current[keys[i]];
        }
        return current;
    };

    const getImageUrl = (imageUrl) => {
        return imageUrl ? `${imageUrl}` : '';
    };

    return (
        <div className={styles.comparePage}>
            <h1 className={styles.pageTitle}>Trang so sánh sản phẩm</h1>

            <div className={styles.selectedProduct}>
                {selectedProductId.length > 0 && <p>Sản phẩm đã chọn ID: {selectedProductId[0]}</p>}
                {selectedProductId.length === 0 && <p>Chưa có sản phẩm nào được chọn để so sánh.</p>}
            </div>

            <div className={styles.searchSection}>
                <input
                    type="text"
                    placeholder="Nhập tên sản phẩm thứ 2 cần so sánh"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    style={{ marginRight: "10px", width: "1000px" }}
                />
                <button onClick={handleSearch} className={styles.searchButton}>Tìm kiếm</button>
            </div>

            {secondProduct && (
                <div className={styles.secondProductInfo}>
                    <p>Sản phẩm: {secondProduct.name}</p>
                    {secondProduct.thumbnails && secondProduct.thumbnails[0] && (
                        <Image
                            src={getImageUrl(secondProduct.thumbnails[0].imageUrl)}
                            alt={secondProduct.name}
                            className={styles.secondProductImage}
                            width={100}
                        />
                    )}
                </div>
            )}
            {secondProduct && selectedProductId.length > 0 && (
                <button onClick={handleCompare} className={styles.compareButton}>So sánh</button>
            )}
            {secondProduct && selectedProductId.length === 0 && (
                <p className={styles.warning}>Vui lòng chọn sản phẩm đầu tiên để so sánh.</p>
            )}
            {!secondProduct && selectedProductId.length > 0 && (
                <p className={styles.warning}>Vui lòng tìm kiếm sản phẩm thứ hai để so sánh.</p>
            )}
            {!secondProduct && selectedProductId.length === 0 && (
                <p className={styles.warning}>Vui lòng chọn sản phẩm để so sánh.</p>
            )}

            {comparisonResult && comparisonResult.length === 2 && (
                <div className={styles.comparisonResult}>
                    <h2>Kết quả so sánh</h2>
                    <table className={styles.comparisonTable}>
                        <thead>
                            <tr>
                                <th>Thuộc tính</th>
                                <th>
                                    <div className={styles.productName}>
                                        {comparisonResult[0].name}
                                        {comparisonResult[0].thumbnails && comparisonResult[0].thumbnails[0] && (
                                            <Image
                                                src={getImageUrl(comparisonResult[0].thumbnails[0].imageUrl)}
                                                alt={comparisonResult[0].name}
                                                className={styles.productImage}
                                                width={100}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th>
                                    <div className={styles.productName}>
                                        {comparisonResult[1].name}
                                        {comparisonResult[1].thumbnails && comparisonResult[1].thumbnails[0] && (
                                            <Image
                                                src={getImageUrl(comparisonResult[1].thumbnails[0].imageUrl)}
                                                alt={comparisonResult[1].name}
                                                className={styles.productImage}
                                                width={100}
                                            />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {productFieldsToCompare.map((field) => (
                                <tr key={field.key} className={styles.tableRow}>
                                    <td className={styles.tableCell}>{field.label}</td>
                                    <td className={styles.tableCell}>{getNestedValue(comparisonResult[0], field.key)}</td>
                                    <td className={styles.tableCell}>{getNestedValue(comparisonResult[1], field.key)}</td>
                                </tr>
                            ))}
                            {/* Bạn có thể hiển thị thêm thông tin chi tiết khác ở đây */}
                        </tbody>
                    </table>
                </div>
            )}

            {comparisonResult && comparisonResult.length !== 2 && (
                <div className={styles.comparisonResult}>
                    <h2>Kết quả so sánh</h2>
                    <pre>{JSON.stringify(comparisonResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default ComparePage;