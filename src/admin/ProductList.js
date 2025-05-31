import React, { useState, useEffect } from "react";
import { deleteProduct, getProductListByCategoryId } from "../services/productService";
import {
    Table,
    Carousel,
    Button,
    Modal,
    Pagination,
    notification,
    Collapse,
} from "antd";
import "../admin/ProductList.scss";
import Search from "antd/es/transfer/search";
import { AntDesignOutlined, AppstoreOutlined, AudioOutlined } from "@ant-design/icons";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../config";
const DEFAULT_IMAGE =
    "https://png.pngtree.com/png-clipart/20220113/ourmid/pngtree-transparent-bubble-simple-bubble-png-image_4158141.png";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryProducts, setCategoryProducts] = useState({});
    const [totalPagesMap, setTotalPagesMap] = useState({});
    const [currentPageMap, setCurrentPageMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeCollapseKeys, setActiveCollapseKeys] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const navigate = useNavigate();

    const fetchedCategories = [
        { id: 1, name: "SamSung" },
        { id: 2, name: "Apple" },
        { id: 3, name: "Oppo" },
        { id: 4, name: "Xiaomi" },
        { id: 5, name: "Vivo" },
    ];

    const suffix = (
        <AudioOutlined
            style={{
                fontSize: 16,
                color: "#1677ff",
            }}
        />
    );

    const onSearch = (value, _e, info) => console.log(info?.source, value);

    const fetchCategoryProducts = async (categoryId, page = 0) => {
        try {
            const data = await getProductListByCategoryId(page, 8, categoryId);
            if (data) {
                setCategoryProducts(prev => ({
                    ...prev,
                    [categoryId]: data.content
                }));

                setTotalPagesMap(prev => ({
                    ...prev,
                    [categoryId]: data.totalPages
                }));
            }

        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            notification.error({
                message: "Lỗi",
                description: `Không thể tải sản phẩm cho danh mục ${categoryId}`
            });
        }
    };

    const fetchAllCategoryProducts = async () => {
        setLoading(true);
        setCategories(fetchedCategories);


        const initialCurrentPageMap = {};
        fetchedCategories.forEach(category => {
            initialCurrentPageMap[category.id] = 1;
        });
        setCurrentPageMap(initialCurrentPageMap);


        const fetchPromises = fetchedCategories.map(category =>
            fetchCategoryProducts(category.id, 0)
        );

        await Promise.all(fetchPromises);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllCategoryProducts();
    }, []);

    const handlePageChange = (page, categoryId) => {
        setCurrentPageMap(prev => ({
            ...prev,
            [categoryId]: page
        }));
        fetchCategoryProducts(categoryId, page - 1);
    };

    const getImageUrl = (product) => {
        if (product.thumbnails && product.thumbnails.length > 0) {
            return product.thumbnails.map(
                (thumbnail) => `${thumbnail.imageUrl}`
            );
        }
        return [DEFAULT_IMAGE];
    };

    const showEditModal = (product) => {
        setSelectedProduct(product);
        console.log("SP Cần sửa", product);
        setEditModalVisible(true);
    };

    const showDeleteModal = (product) => {
        setSelectedProduct(product);
        setDeleteModalVisible(true);
    };

    const handleEditCancel = () => {
        setEditModalVisible(false);
    };

    const handleDeleteCancel = () => {
        setDeleteModalVisible(false);
    };

    const handleEditConfirm = () => {
        notification.success({ message: "Sản phẩm đã được chỉnh sửa" });
        fetchAllCategoryProducts(); // Tải lại dữ liệu
        handleEditSuccess();
        setEditModalVisible(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log(selectedProduct);
            const response = await deleteProduct(selectedProduct.id); // Gọi API xóa sản phẩm
            if (response.code === 9999) {
                throw new Error(response.message);
            }
            notification.success({ message: "Sản phẩm đã được xóa" });
            setDeleteModalVisible(false);
            fetchAllCategoryProducts(); // Cập nhật lại danh sách sản phẩm
        } catch (error) {
            notification.error({ message: "Bạn không có quyền xóa sản phẩm" });
        }
    };

    // Callback sau khi thêm sản phẩm thành công
    const handleAddSuccess = () => {
        // Sau khi thêm thành công, cập nhật lại danh sách sản phẩm
        fetchAllCategoryProducts();
    };
    const handleEditSuccess = () => {
        fetchAllCategoryProducts(); // Cập nhật lại danh sách sản phẩm
    };
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (

                <a
                    href={`/product/${record.id}`}
                    onClick={(e) => {
                        e.preventDefault();
                        handleViewProductDetail(record.id);
                    }}
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer', textDecoration: 'none' }}
                >
                    {text}
                </a>
            ),
        },
        { title: "Giá (VNĐ)", dataIndex: "price", key: "price" },
        {
            title: "Hình ảnh",
            dataIndex: "thumbnails",
            key: "thumbnails",
            render: (_, product) => (
                <div style={{ width: "100px", height: "100px" }}>
                    <Carousel>
                        {getImageUrl(product).map((imageUrl, index) => (
                            <img
                                key={index}
                                src={imageUrl}
                                alt={product.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ))}
                    </Carousel>
                </div>
            ),
        },
        {
            title: "Màu sắc",
            dataIndex: "colors",
            key: "colors",
            render: (colors) => {
                console.log('Mảng colors hiện tại:', colors);

                if (colors && colors.length > 0) {
                    return colors.map((colorItem, index) => {
                        const colorText = colorItem?.color || colorItem;
                        const colorId = colorItem?.id;

                        return (
                            <span key={index}>
                                {colorId ? (
                                    <Tooltip
                                        title={`ID: ${colorId}`}
                                        mouseEnterDelay={0.1}
                                        placement="top"
                                    >
                                        <span
                                            style={{
                                                cursor: 'help',
                                                borderBottom: '1px dotted #1890ff',
                                                color: '#1890ff'
                                            }}
                                        >
                                            {colorText}
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <span>{colorText}</span>
                                )}
                                {index < colors.length - 1 && ' / '}
                            </span>
                        );
                    });
                }
                return "Không có màu";
            },
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, product) => (
                <>
                    <Button type="primary" onClick={() => showEditModal(product)}>
                        Chỉnh sửa
                    </Button>
                    <Button type="danger" onClick={() => showDeleteModal(product)}>
                        Xóa
                    </Button>
                </>
            ),
        },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }
    const handleViewProductDetail = (productId) => {
        navigate(`/product/${productId}`);
    };
    return (
        <div className="productList">
            <div className="headerPro">
                <Button
                    style={{ width: "150px" }}
                    type="primary"
                    size="large"
                    icon={<AntDesignOutlined />}
                    onClick={() => setAddModalVisible(true)}
                >
                    Thêm mới
                </Button>
                <div style={{ marginLeft: "auto", maxWidth: "300px" }}>
                    <Search
                        placeholder="Tìm kiếm sản phẩm"
                        allowClear
                        enterButton="Tìm kiếm"
                        size="large"
                        onSearch={onSearch}
                    />
                </div>
            </div>

            <h2>Quản lý Sản phẩm</h2>
            <Collapse
                activeKey={activeCollapseKeys}
                onChange={(keys) => setActiveCollapseKeys(keys)}
            >
                {categories.map((category) => (
                    <Collapse.Panel
                        header={
                            <span>
                                <AppstoreOutlined style={{ marginRight: 8 }} />
                                Hãng sản phẩm: {category.name}
                            </span>
                        }
                        key={category.id.toString()}
                    >
                        <Table
                            dataSource={categoryProducts[category.id] || []}
                            columns={columns}
                            pagination={false}
                            rowKey="id"
                        />
                        <Pagination
                            current={currentPageMap[category.id] || 1}
                            total={(totalPagesMap[category.id] || 1) * 10}
                            onChange={(page) => handlePageChange(page, category.id)}
                            style={{ marginTop: "20px", textAlign: "center" }}
                        />
                    </Collapse.Panel>
                ))}
            </Collapse>



            <Modal
                title="Xóa sản phẩm"
                visible={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            >
                <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
            </Modal>
            <EditProductModal
                title="Chỉnh sửa sản phẩm"
                visible={editModalVisible}
                onCancel={handleEditCancel}
                onOk={handleEditConfirm}
                categories={categories}
                product={selectedProduct}
            />
            {/* Form chỉnh sửa sản phẩm */}

            {/* Sử dụng AddProductModal */}
            <AddProductModal
                visible={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                onSuccess={handleAddSuccess}
                categories={categories}
            />
        </div>
    );
}

export default ProductList;