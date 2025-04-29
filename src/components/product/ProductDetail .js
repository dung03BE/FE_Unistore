import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCommentsByProductId, getProductById } from "../../services/productService";
import { Button, Carousel, Image, message, notification } from "antd";
import "./ProductDetails.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartSuccess, updateQuantity } from "../../actions/cart";
import { addToCartAPI, getCart } from "../../services/cartService";

import { StarTwoTone, CalculatorTwoTone, FileSearchOutlined } from '@ant-design/icons';
import ProductSpecs from "./productspec/ProductSpecs";
import CommitmentBox from "./productspec/CommitmentBox";
import ChatRoom from "../ChatSocket/ChatRoom";
import { addToCompare } from "../../actions/compare";
import { getInventoryByProduct } from "../../services/inventoryService"; // Import hàm lấy inventory
import { BASE_URL } from "../../config";
const DEFAULT_IMAGE = "https://png.pngtree.com/png-clipart/20220113/ourmid/pngtree-transparent-bubble-simple-bubble-png-image_4158141.png";

function ProductDetails({ products }) {
    const navigate = useNavigate();
    const [isComparing, setIsComparing] = useState(false);
    const dispatch = useDispatch();
    const { id: productId } = useParams(); // Đổi tên id thành productId để rõ ràng hơn
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(DEFAULT_IMAGE); // Ảnh chính
    const [selectedColor, setSelectedColor] = useState(null);
    const [inventory, setInventory] = useState([]); // State để lưu trữ thông tin kho
    const cart = useSelector(state => state.cartReducer);
    const [fourthImage, setFourthImage] = useState(null);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false); // Thêm state để kiểm soát hiển thị comment
    const [isAddToCartDisabled, setIsAddToCartDisabled] = useState(true); // State để kiểm soát trạng thái nút

    const offers = [
        {
            id: 1,
            description: 'Phiếu mua hàng 200,000đ'
        },
        {
            id: 2,
            description: 'Gói bảo hiểm rơi vỡ màn hình 6 tháng'
        },
        {
            id: 3,
            description: 'Tặng thêm 6 tháng bảo hành mở rộng'
        },
        {
            id: 4,
            description: 'Phiếu mua hàng trị giá 700,000đ mua tablet (trừ Ipad) có niêm yết từ 5,000,000đ'
        },
        {
            id: 5,
            description: 'Phiếu mua hàng áp dụng mua tất cả sim có gói Mobi, Itel, Local, Vina và VNMB trị giá 50,000đ',
            link: '#details-link' // You would replace this with your actual link
        }
    ];

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const data = await getProductById(productId);

                if (data) {
                    setProduct(data);
                    setMainImage(`${data.thumbnails?.[0]?.imageUrl || DEFAULT_IMAGE}`);
                    // Cập nhật state fourthImage
                    if (data.thumbnails && data.thumbnails.length >= 4) {
                        setFourthImage(`${data.thumbnails?.[3].imageUrl}`);
                    } else if (data.thumbnails && data.thumbnails.length >= 2) { // Sử dụng ảnh thứ 2 nếu ảnh thứ 4 không có
                        setFourthImage(`${data.thumbnails?.[1].imageUrl}`);
                    } else if (data.thumbnails && data.thumbnails.length >= 1) { // Sử dụng ảnh thứ 2 nếu ảnh thứ 4 không có
                        setFourthImage(`${data.thumbnails?.[0].imageUrl}`);
                    } else {
                        setFourthImage(DEFAULT_IMAGE);
                    }
                }
                setLoading(false);

                // Gọi API lấy comment
                const fetchComments = async () => {
                    try {
                        const data = await getCommentsByProductId(productId);
                        setComments(data);
                        console.log("comment:", data);
                    } catch (error) {
                        console.error("Error fetching comments:", error);
                    }
                };
                fetchComments();

            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    // Gọi API lấy inventory khi component mount hoặc khi productId thay đổi
    useEffect(() => {
        const fetchInventory = async () => {
            if (productId) {
                try {
                    const inventoryData = await getInventoryByProduct(productId);
                    setInventory(inventoryData);
                    console.log("Inventory Data:", inventoryData);

                    // Cập nhật trạng thái nút ban đầu
                    if (selectedColor && inventoryData && inventoryData.length > 0) {
                        const initialInventory = inventoryData.find(
                            (item) => item.color.toLowerCase() === selectedColor.toLowerCase()
                        );
                        setIsAddToCartDisabled(!initialInventory || initialInventory.quantity <= 0);
                        const quantityElement = document.getElementById("inventory-item");
                        if (quantityElement) {
                            quantityElement.textContent = `${initialInventory ? initialInventory.quantity + ' sản phẩm có sẵn' : "Không có sẵn"}`;
                            quantityElement.style.opacity = 0.6;
                        }
                    } else if (!selectedColor) {
                        setIsAddToCartDisabled(true); // Vô hiệu hóa khi chưa chọn màu
                        const quantityElement = document.getElementById("inventory-item");
                        if (quantityElement) {
                            quantityElement.textContent = `Số lượng kho: Vui lòng chọn màu`;
                            quantityElement.style.opacity = 0.6;
                        }
                    } else {
                        setIsAddToCartDisabled(true); // Vô hiệu hóa nếu không tìm thấy inventory
                        const quantityElement = document.getElementById("inventory-item");
                        if (quantityElement) {
                            quantityElement.textContent = `Không có sẵn`;
                            quantityElement.style.opacity = 0.6;
                        }
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin kho:", error);
                    setIsAddToCartDisabled(true);
                    const quantityElement = document.getElementById("inventory-item");
                    if (quantityElement) {
                        quantityElement.textContent = `Lỗi khi tải số lượng kho`;
                        quantityElement.style.opacity = 0.6;
                    }
                }
            }
        };
        fetchInventory();
    }, [productId, selectedColor]);

    // Cập nhật trạng thái nút khi màu sắc thay đổi
    useEffect(() => {
        if (selectedColor && inventory && inventory.length > 0) {
            const selectedInventory = inventory.find(
                (item) => item.color.toLowerCase() === selectedColor.toLowerCase()
            );
            const hasStock = selectedInventory && selectedInventory.quantity > 0;
            setIsAddToCartDisabled(!hasStock); // Cập nhật trạng thái nút
            const quantityElement = document.getElementById("inventory-item");
            if (quantityElement) {
                quantityElement.textContent = `${selectedInventory ? selectedInventory.quantity + ' sản phẩm có sẵn' : "Không có sẵn"}`;
                quantityElement.style.opacity = 0.6;
            }
        } else if (!selectedColor) {
            setIsAddToCartDisabled(true); // Vô hiệu hóa khi chưa chọn màu
            const quantityElement = document.getElementById("inventory-item");
            if (quantityElement) {
                quantityElement.textContent = `Số lượng kho: Vui lòng chọn màu`;
                quantityElement.style.opacity = 0.6;
            } else {
                setIsAddToCartDisabled(true); // Vô hiệu hóa nếu không có inventory
                const quantityElement = document.getElementById("inventory-item");
                if (quantityElement) {
                    quantityElement.textContent = `Không có sẵn`;
                    quantityElement.style.opacity = 0.6;
                }
            }
        }
    }, [selectedColor, inventory]);

    console.log("Product:", product);
    if (loading) return <div>Đang tải thông tin sản phẩm...</div>;
    if (!product) return <div>Không tìm thấy sản phẩm này.</div>;

    const getImageUrls = () => product.thumbnails?.map((thumb) => `${thumb.imageUrl}`) || [];

    const handleColorClick = (color) => {
        setSelectedColor(color);
    };

    const handleAddToCart = async () => {
        if (!selectedColor) {
            notification.error({
                message: 'Lỗi',
                description: 'Vui lòng chọn màu sản phẩm.',
            });
            return;
        }

        // Kiểm tra số lượng trong kho trước khi thêm vào giỏ hàng
        const selectedInventory = inventory.find(
            (item) => item.color.toLowerCase() === selectedColor.toLowerCase()
        );

        if (!selectedInventory || selectedInventory.quantity <= 0) {
            notification.error({
                message: 'Lỗi',
                description: 'Sản phẩm này hiện đang hết hàng với màu đã chọn.',
            });
            return;
        }

        try {
            const result = await addToCartAPI(product.id, 1, selectedColor);
            console.log("Result:", result);
            const updatedCart = await getCart();
            dispatch(fetchCartSuccess(updatedCart));
            if (updatedCart.code == 1013) {
                message.error("Out of stock");
                return;
            }
            if (result === "LoginValid") {
                message.error("Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng");
                return;
            }
            notification.success({
                message: 'Thành công',
                description: 'Sản phẩm đã được thêm vào giỏ hàng.',
            });
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.',
            });
        }
    };
    const toggleComments = () => {
        setShowComments(!showComments);
    };
    const handleCompareClick = () => {
        dispatch(addToCompare(product.id));
        message.info("Đã thêm sản phẩm vào danh sách so sánh");
        // Chuyển hướng đến trang so sánh (tùy chọn)
        navigate('/compare');
    };
    return (
        <>
            <div className="product-name">

                <div className="box02">
                    <h1 className="product__title"> {product.name}</h1>
                    <span className="quantity-sale">Đã bán 94,5k</span>


                    <div className="box02__left">
                        <div className="detail-rate">
                            <p><i className="icondetail-bigstar"></i> <StarTwoTone />4.9</p>
                        </div>
                    </div>
                    <div className="box02__right" data-id="329149" data-href="/dtdd/iphone-16-pro-max" data-img="https://cdn.tgdd.vn/Products/Images/42/329149/iphone-16-pro-max-sa-mac-thumb-600x600.jpg" data-name="Điện thoại iPhone 16 Pro Max 256GB">
                        <i className="icondetail-sosanh"></i>
                        <span onClick={handleCompareClick}>So sánh</span> <FileSearchOutlined />
                    </div>
                    <a href="#tab-spec" className="tab-spec">
                        <i className="icondetail-spec"></i>
                        <CalculatorTwoTone />Thông số
                    </a>
                </div>
            </div>
            <div className="box_main">

                <div className="box_left">

                    {/* Ảnh lớn */}
                    <div className="main-image">

                        <Image
                            src={mainImage}
                            alt={product.name}
                            className="main-product-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_IMAGE;
                            }}
                        />
                    </div>

                    {/* Danh sách ảnh nhỏ */}
                    <div className="thumbnail-list">
                        {getImageUrls().map((imageUrl, index) => (
                            <img
                                key={index}
                                src={imageUrl}
                                alt={`Thumbnail ${index + 1}`}
                                className="thumbnail-image"
                                onClick={() => setMainImage(imageUrl)} // Đổi ảnh chính khi click
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_IMAGE;
                                }}
                            />
                        ))}
                    </div>



                    <div className="product__description">
                        <CommitmentBox />
                        {product.description}

                        {fourthImage && ( // Hiển thị hình ảnh thứ 4 nếu có
                            <img
                                src={fourthImage}
                                alt="Hình ảnh thứ 4"
                                style={{ width: '100%', height: '500px', borderRadius: '10px' }} // Tùy chỉnh kích thước và kiểu dáng
                            />
                        )}
                        <div className="product__description-cauhinh">
                            <br /> Thông số kỹ thuật
                            <ProductSpecs details={product.details} />
                        </div>

                    </div>

                </div>

                <div className="box_right">
                    <a
                        href="https://www.thegioididong.com/dtdd/xiaomi-15-ultra#game" // Thay thế bằng URL bạn muốn chuyển hướng đến
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/40/ef/40efe61ec3a552d5c796eb7cd74ddb7c.png"
                            alt="Advertisement"
                            width="100%"
                        />
                    </a>

                    <div className="color-picker">
                        {product.colors?.map((color) => (

                            <button
                                key={color.id}
                                className={`color-option ${selectedColor === color.color ? "selected" : ""
                                    }`}
                                onClick={() => handleColorClick(color.color)}

                            >
                                <button style={{
                                    backgroundColor: color.color.toLowerCase().replace("titanium ", ""),
                                    color:
                                        color.color.toLowerCase().includes("white") ||
                                            color.color.toLowerCase().includes("light")
                                            ? "black"
                                            : "white",
                                    borderRadius: "50%",
                                    width: "25px",
                                    height: "25px",
                                }} />
                                {color.color}
                            </button>

                        ))}
                    </div>
                    <div id="selected-color">
                        Màu đã chọn: <span>{selectedColor}</span>
                    </div>
                    <div id="inventory-item" style={{ opacity: 0.6, fontSize: "20px" }}>
                        Số lượng kho: Vui lòng chọn màu
                    </div>
                    <div className="header__price">
                        Mua ngay với giá
                    </div>
                    <div className="product__price">

                        <div className="price">
                            {product.price?.toLocaleString()}₫
                        </div>
                    </div>
                    <div className="inner-box">
                        {offers.map(offer => (
                            <div key={offer.id} className="offer-item" >
                                <span className="offer-badge">{offer.id}.</span>
                                <span className="offer-description">
                                    {' '}{offer.description}
                                    {offer.link && <a href={offer.link}> (Xem chi tiết tại đây)</a>}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="product__buttons">
                        <button onClick={handleAddToCart} disabled={!selectedColor}> Thêm vào giỏ 🛒</button>
                        <button >Mua ngay</button>
                    </div>
                </div>

            </div>
            <div className="comment">
                <button onClick={toggleComments}>
                    {showComments ? "Ẩn bình luận" : "Xem bình luận"}
                </button>
                {showComments && <ChatRoom initialComments={comments} productId={productId} />}
            </div>
        </>
    );
}

export default ProductDetails;