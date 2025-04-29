import React, { useEffect, useState } from "react";
import { Table, Input, Button, Space, Tag, Modal, Form, Select, DatePicker, InputNumber, message } from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAllCoupon, createCoupon, deleteCoupon } from "../services/paymentService";
import moment from "moment";
import "./PromotionList.scss"; // Import file CSS cho component này

const { RangePicker } = DatePicker;

function PromotionList() {
    const [couponData, setCouponData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const allCoupons = await getAllCoupon();
            console.log("Dữ liệu coupon trả về:", allCoupons);
            if (Array.isArray(allCoupons)) {
                setCouponData(allCoupons);
            } else {
                console.error("Dữ liệu coupon không hợp lệ:", allCoupons);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu coupon:", error);
            // Xử lý lỗi nếu cần
        } finally {
            setLoading(false);
        }
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

    const handleDeleteCoupon = async (id) => {
        setDeleteLoading(id);
        try {
            const response = await deleteCoupon({ id });
            if (response && response.success) { // Kiểm tra thuộc tính success nếu putAuth trả về object
                message.success("Xóa coupon thành công!");
                fetchCoupons();
            } else if (response === null) { // Kiểm tra nếu putAuth trả về null
                message.success("Xóa coupon thành công!");
                fetchCoupons();
            } else {
                message.success("Xóa coupon thành công!"); // Nếu putAuth chỉ trả về void hoặc không rõ ràng
                fetchCoupons();
            }
        } catch (error) {
            console.error("Lỗi khi xóa coupon:", error);
            message.error("Lỗi khi xóa coupon!");
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            width: 60,
        },
        {
            title: "Mã Coupon",
            dataIndex: "code",
            key: "code",
            ...getColumnSearchProps("code"),
            width: 120,
        },
        {
            title: "Loại",
            dataIndex: "discountType",
            key: "discountType",
            filters: [
                { text: "Phần trăm", value: "percentage" },
                { text: "Cố định", value: "fixed" },
            ],
            onFilter: (value, record) => record.discountType === value,
            render: (type) => (type === "percentage" ? "Phần trăm" : "Cố định"),
            width: 100,
        },
        {
            title: "Giá trị",
            dataIndex: "discountValue",
            key: "discountValue",
            sorter: (a, b) => a.discountValue - b.discountValue,
            render: (value, record) =>
                record.discountType === "percentage" ? `${value * 100}%` : value,
            width: 80,
        },
        {
            title: "Bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
            width: 120,
            className: "hide-on-small",
        },
        {
            title: "Kết thúc",
            dataIndex: "endDate",
            key: "endDate",
            sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
            width: 120,
            className: "hide-on-small",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Hoạt động", value: "active" },
                { text: "Hết hạn", value: "expired" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>{status === "active" ? "Hoạt động" : "Hết hạn"}</Tag>
            ),
            width: 90,
        },
        {
            title: "SL Sử dụng",
            dataIndex: "usageLimit",
            key: "usageLimit",
            sorter: (a, b) => (a.usageLimit || Infinity) - (b.usageLimit || Infinity),
            render: (limit) => limit === null ? "∞" : limit,
            className: "hide-on-medium",
            width: 80,
        },
        {
            title: "Đã dùng",
            dataIndex: "usedCount",
            key: "usedCount",
            sorter: (a, b) => (a.usedCount || 0) - (b.usedCount || 0),
            render: (count) => count === null ? 0 : count,
            className: "hide-on-medium",
            width: 80,
        },
        {
            title: "SL User",
            dataIndex: "userLimit",
            key: "userLimit",
            sorter: (a, b) => (a.userLimit || Infinity) - (b.userLimit || Infinity),
            render: (limit) => limit === null ? "∞" : limit,
            className: "hide-on-large",
            width: 80,
        },
        {
            title: "User ID",
            dataIndex: "userId",
            key: "userId",
            sorter: (a, b) => (a.userId || Infinity) - (b.userId || Infinity),
            render: (userId) => userId === null ? "-" : userId,
            className: "hide-on-large",
            width: 80,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    {/* <Button size="small">Sửa</Button> */}
                    <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        size="small"
                        loading={deleteLoading && deleteLoading === record.id}
                        onClick={() => handleDeleteCoupon(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
            width: 80,
            fixed: "right", // Để cột hành động cố định bên phải khi scroll ngang
        },
    ];

    const showCreateModal = () => {
        setIsCreateModalVisible(true);
    };

    const handleCreateModalCancel = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    const handleCreateCoupon = async (values) => {
        try {
            const formattedValues = {
                ...values,
                startDate: values.dateRange[0].format("YYYY-MM-DDTHH:mm:ss"),
                endDate: values.dateRange[1].format("YYYY-MM-DDTHH:mm:ss"),
            };
            delete formattedValues.dateRange;
            const response = await createCoupon(formattedValues);
            message.success("Tạo coupon thành công!");
            console.log("Phản hồi tạo coupon:", response);
            setIsCreateModalVisible(false);
            createForm.resetFields();
            fetchCoupons(); // Tải lại danh sách coupon
        } catch (error) {
            console.error("Lỗi khi tạo coupon:", error);
            message.error("Lỗi khi tạo coupon!");
            // Hiển thị thông báo lỗi cho người dùng nếu cần
        }
    };

    return (
        <div className="promotion-list-container">
            <h1>Quản lý Coupon</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} style={{ marginBottom: 16 }}>
                Thêm Coupon
            </Button>
            {loading ? (
                <div>Đang tải dữ liệu coupon...</div>
            ) : (
                <Table
                    dataSource={couponData}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: "max-content" }}
                />
            )}

            <Modal
                title="Tạo Coupon Mới"
                visible={isCreateModalVisible}
                onCancel={handleCreateModalCancel}
                footer={null}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreateCoupon}>
                    <Form.Item
                        name="code"
                        label="Mã Coupon"
                        rules={[{ required: true, message: "Vui lòng nhập mã coupon!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="discountType"
                        label="Loại Giảm Giá"
                        rules={[{ required: true, message: "Vui lòng chọn loại giảm giá!" }]}
                    >
                        <Select>
                            <Select.Option value="percentage">Phần trăm</Select.Option>
                            <Select.Option value="fixed">Cố định</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="discountValue"
                        label="Giá trị Giảm Giá"
                        rules={[{ required: true, message: "Vui lòng nhập giá trị giảm giá!" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian Áp dụng"
                        rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng!" }]}
                    >
                        <RangePicker format="YYYY-MM-DD HH:mm:ss" showTime />
                    </Form.Item>

                    <Form.Item
                        name="userLimit"
                        label="Giới hạn Người dùng"
                        rules={[{ required: true, message: "Vui lòng nhập giới hạn người dùng!" }]}
                        initialValue={1}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="usageLimit"
                        label="Tổng Giới hạn Sử dụng"
                        rules={[{ required: true, message: "Vui lòng nhập tổng giới hạn sử dụng!" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="userId" label="ID Người dùng (tùy chọn)">
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Tạo
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default PromotionList;