import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Form,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { getAllInventory, updateInventory, createInventory } from "../services/inventoryService";

function InventoryManagement() {
    const [inventoryData, setInventoryData] = useState([]);
    const [totalInventory, setTotalInventory] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingQuantity, setEditingQuantity] = useState(null);

    // State cho modal tạo mới kho
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    useEffect(() => {
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        setLoading(true);
        try {
            const allInventory = await getAllInventory();
            console.log("Dữ liệu trả về từ API:", allInventory);

            if (Array.isArray(allInventory)) {
                setInventoryData(allInventory);
                calculateTotalInventory(allInventory);
            } else {
                console.error("Dữ liệu kho không hợp lệ:", allInventory);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu kho:", error);
            message.error("Lỗi khi tải dữ liệu kho");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalInventory = (data) => {
        const totals = {};
        data.forEach((item) => {
            if (totals[item.productId]) {
                totals[item.productId] += item.quantity;
            } else {
                totals[item.productId] = item.quantity;
            }
        });
        setTotalInventory(totals);
    };

    const isEditing = (record) => record.id === editingId;

    const handleEdit = (record) => {
        setEditingId(record.id);
        setEditingQuantity(record.quantity);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingQuantity(null);
    };

    const handleSaveEdit = async (record) => {
        try {
            const updatedData = {
                productId: record.productId,
                productColorId: record.productColorId,
                quantity: editingQuantity,
            };
            const response = await updateInventory(record.id, updatedData);
            console.log("Phản hồi từ API cập nhật:", response);
            message.success(`Đã cập nhật số lượng cho ID ${record.id}`);
            setEditingId(null);
            setEditingQuantity(null);
            fetchInventoryData(); // Tải lại dữ liệu sau khi cập nhật thành công
        } catch (error) {
            console.error("Lỗi khi cập nhật inventory:", error);
            message.error(`Lỗi khi cập nhật số lượng cho ID ${record.id}`);
        }
    };

    const handleQuantityChange = (e) => {
        setEditingQuantity(e.target.value);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Đặt lại
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: true });
                            setSearchText("");
                            setSearchedColumn("");
                        }}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
        render: (text) =>
            searchedColumn === dataIndex ? (
                <span>
                    {text
                        .toString()
                        .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, "i"))
                        .map((fragment, i) =>
                            fragment.toLowerCase() === searchText.toLowerCase() ? (
                                <span key={i} style={{ fontWeight: "bold", color: "#1890ff" }}>
                                    {fragment}
                                </span>
                            ) : (
                                fragment
                            )
                        )}
                </span>
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: "ID Sản phẩm",
            dataIndex: "productId",
            key: "productId",
            ...getColumnSearchProps("productId"),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "productName",
            key: "productName",
            ...getColumnSearchProps("productName"),
        },
        {
            title: "Màu sắc",
            dataIndex: "color",
            key: "color",
            ...getColumnSearchProps("color"),
            render: (color) => (color ? <Tag color="processing">{color}</Tag> : "-"),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            sorter: (a, b) => a.quantity - b.quantity,
            render: (text, record) => {
                if (isEditing(record)) {
                    return <Input type="number" value={editingQuantity} onChange={handleQuantityChange} />;
                }
                return text;
            },
        },
        {
            title: "Tổng số lượng",
            key: "totalQuantity",
            render: (text, record) => totalInventory[record.productId] || 0,
            sorter: (a, b) => (totalInventory[a.productId] || 0) - (totalInventory[b.productId] || 0),
        },
        {
            title: "Hành động",
            key: "action",
            render: (text, record) => {
                const editable = isEditing(record);
                return (
                    <Space size="middle">
                        {editable ? (
                            <Space size="middle">
                                <Button
                                    icon={<SaveOutlined />}
                                    onClick={() => handleSaveEdit(record)}
                                >
                                    Lưu
                                </Button>
                                <Button onClick={handleCancelEdit} icon={<CloseOutlined />}>
                                    Hủy
                                </Button>
                            </Space>
                        ) : (
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                                Chỉnh sửa
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    // Modal hiển thị form tạo mới kho
    const showCreateModal = () => {
        setIsCreateModalVisible(true);
    };

    const handleCreateModalCancel = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    const handleCreateInventory = async (values) => {
        const newInventory = {
            productId: parseInt(values.productId),
            productColorId: parseInt(values.productColorId),
            quantity: parseInt(values.quantity),
        };

        try {
            await createInventory(newInventory);
            message.success("Tạo mới kho thành công");
            fetchInventoryData(); // Tải lại dữ liệu
            setIsCreateModalVisible(false);
            createForm.resetFields();
        } catch (error) {
            console.error("Lỗi khi tạo mới kho:", error);
            message.error("Lỗi khi tạo mới kho");
        }
    };

    return (
        <>
            <h1>Quản lý Kho</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} style={{ marginBottom: 16 }}>
                Thêm mới kho
            </Button>

            {loading ? (
                <div>Đang tải dữ liệu kho...</div>
            ) : (
                <Table dataSource={inventoryData} columns={columns} rowKey={(record) => record.id} />
            )}

            {/* Modal tạo mới kho */}
            <Modal
                title="Thêm mới kho"
                visible={isCreateModalVisible}
                onCancel={handleCreateModalCancel}
                footer={null}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateInventory}>
                    <Form.Item
                        name="productId"
                        label="ID Sản phẩm"
                        rules={[{ required: true, message: "Vui lòng nhập ID sản phẩm" }]}
                    >
                        <Input type="number" min={1} />
                    </Form.Item>
                    <Form.Item
                        name="productColorId"
                        label="ID Màu sắc sản phẩm"
                        rules={[{ required: true, message: "Vui lòng nhập ID màu sắc sản phẩm" }]}
                    >
                        <Input type="number" min={1} />
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Tạo mới
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={handleCreateModalCancel}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default InventoryManagement;