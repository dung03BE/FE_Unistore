import React, { useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Upload,
    notification,
    Divider,
    Space,
    Tag,
    Row,
    Col,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { createProduct, uploadImages } from "../services/productService";
import "../admin/AddProductModal.scss"; // import file CSS tùy chỉnh

const AddProductModal = ({ visible, onCancel, onSuccess, categories }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [colorInputVisible, setColorInputVisible] = useState(false);
    const [colorInputValue, setColorInputValue] = useState("");
    const [colors, setColors] = useState([]);

    const handleColorInputChange = (e) => {
        setColorInputValue(e.target.value);
    };

    const handleColorInputConfirm = () => {
        if (colorInputValue && !colors.includes(colorInputValue)) {
            setColors([...colors, colorInputValue]);
        }
        setColorInputVisible(false);
        setColorInputValue("");
    };

    const handleRemoveColor = (removedColor) => {
        const newColors = colors.filter((color) => color !== removedColor);
        setColors(newColors);
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };



    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            // Format the product data
            const productData = {
                name: values.name,
                price: values.price,
                description: values.description,
                categoryId: values.categoryId,
                discount: values.discount || 0,
                brand: values.brand,
                model: values.model,
                availble: values.availble === undefined ? 1 : values.availble,
                colors: colors,
                details: {
                    screen_size: values.screen_size,
                    resolution: values.resolution,
                    processor: values.processor,
                    ram: values.ram,
                    storage: values.storage,
                    battery: values.battery,
                    camera: values.camera,
                    os: values.os,
                    weight: values.weight,
                    dimensions: values.dimensions,
                    sim: values.sim,
                    network: values.network,
                },
            };

            // Create the product
            const result = await createProduct(productData);
            console.log("result createProduct: ", result); // Kiểm tra xem có result.id không
            // If there are images to upload
            console.log("productId:", result.result.id, "files:", fileList);
            if (fileList.length > 0 && result.result && result.result.id) {
                console.log("Chưa vào đây");
                console.log("productId:", result.result.id, "files:", fileList);
                uploadImages(result.result.id, fileList);
            }

            notification.success({
                message: "Thành công",
                description: "Sản phẩm đã được tạo thành công",
            });

            // Reset form and state
            form.resetFields();
            setColors([]);
            setFileList([]);

            if (onSuccess) onSuccess();
            onCancel();
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể tạo sản phẩm. Vui lòng thử lại.",
            });
            console.error("Error creating product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm mới sản phẩm"
            open={visible}
            onCancel={onCancel}
            width={1200}
            className="add-product-modal"
            style={{ marginRight: '140px' }}
            footer={[
                <Button key="back" onClick={onCancel} className="modal-btn cancel-btn">
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit} className="modal-btn submit-btn">
                    Thêm mới
                </Button>,
            ]}
        >
            <div className="modal-content">
                <Form form={form} layout="vertical" name="add_product_form" initialValues={{ availble: 1 }}>
                    <Divider orientation="left">Thông tin cơ bản</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá (VNĐ)"
                                rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    placeholder="Nhập giá sản phẩm"
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả sản phẩm" }]}
                    >
                        <Input.TextArea placeholder="Nhập mô tả sản phẩm" rows={3} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="categoryId"
                                label="Danh mục"
                                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map((category) => (
                                        <Select.Option key={category.id} value={category.id}>
                                            {category.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="discount" label="Giảm giá (%)">
                                <InputNumber style={{ width: "100%", height: "40px" }} placeholder="Nhập % giảm giá" min={0} max={100} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="availble" label="Trạng thái">
                                <Select>
                                    <Select.Option value={1}>Còn hàng</Select.Option>
                                    <Select.Option value={0}>Hết hàng</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="brand"
                                label="Thương hiệu"
                                rules={[{ required: true, message: "Vui lòng nhập thương hiệu" }]}
                            >
                                <Input placeholder="Nhập thương hiệu" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="model"
                                label="Model"
                                rules={[{ required: true, message: "Vui lòng nhập model" }]}
                            >
                                <Input placeholder="Nhập model" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Màu sắc">
                        <Space style={{ flexWrap: "wrap" }}>
                            {colors.map((color) => (
                                <Tag
                                    key={color}
                                    closable
                                    onClose={() => handleRemoveColor(color)}
                                    style={{ marginBottom: 8 }}
                                >
                                    {color}
                                </Tag>
                            ))}
                            {colorInputVisible ? (
                                <Input
                                    type="text"
                                    size="small"
                                    style={{ width: 78 }}
                                    value={colorInputValue}
                                    onChange={handleColorInputChange}
                                    onBlur={handleColorInputConfirm}
                                    onPressEnter={handleColorInputConfirm}
                                    autoFocus
                                />
                            ) : (
                                <Tag onClick={() => setColorInputVisible(true)} className="site-tag-plus">
                                    <PlusOutlined /> Thêm màu
                                </Tag>
                            )}
                        </Space>
                    </Form.Item>

                    <Divider orientation="left">Thông số kỹ thuật</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="screen_size" label="Kích thước màn hình">
                                <Input placeholder="Nhập kích thước" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="resolution" label="Độ phân giải">
                                <Input placeholder="Nhập độ phân giải" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="processor" label="Bộ vi xử lý">
                                <Input placeholder="Nhập bộ vi xử lý" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="ram" label="RAM">
                                <Input placeholder="Nhập RAM" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="storage" label="Bộ nhớ">
                                <Input placeholder="Nhập bộ nhớ" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="battery" label="Pin">
                                <Input placeholder="Nhập dung lượng pin" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="camera" label="Camera">
                                <Input placeholder="Nhập thông số camera" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="os" label="Hệ điều hành">
                                <Input placeholder="Nhập hệ điều hành" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="weight" label="Trọng lượng">
                                <Input placeholder="Nhập trọng lượng" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dimensions" label="Kích thước">
                                <Input placeholder="Nhập kích thước" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="sim" label="SIM">
                                <Input placeholder="Nhập loại SIM" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="network" label="Mạng">
                                <Input placeholder="Nhập mạng hỗ trợ" />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Form.Item
                        name="images"
                        label="Tải lên hình ảnh"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={({ fileList }) => setFileList(fileList)}
                            multiple
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default AddProductModal;
