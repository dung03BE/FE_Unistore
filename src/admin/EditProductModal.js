import React, { useEffect, useState } from "react";
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
import { updateProduct } from "../services/productService";
import "../admin/AddProductModal.scss"; // import file CSS tùy chỉnh
import { BASE_URL } from "../config";

const EditProductModal = ({ visible, onCancel, onOk, categories, product }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [colorInputVisible, setColorInputVisible] = useState(false);
    const [colorInputValue, setColorInputValue] = useState("");
    const [colors, setColors] = useState([]);
    // State to store the URLs of uploaded images
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);


    useEffect(() => {
        if (product) {
            form.setFieldsValue({
                name: product.name,
                price: product.price,
                description: product.description,
                categoryId: product.categoryId,
                discount: product.discount,
                brand: product.brand,
                model: product.model,
                available: product.available, // Sửa từ availble thành available để phù hợp với backend
                screen_size: product.details?.screen_size,
                resolution: product.details?.resolution,
                processor: product.details?.processor,
                ram: product.details?.ram,
                storage: product.details?.storage,
                battery: product.details?.battery,
                camera: product.details?.camera,
                os: product.details?.os,
                weight: product.details?.weight,
                dimensions: product.details?.dimensions,
                sim: product.details?.sim,
                network: product.details?.network,
            });
            setColors(product.colors?.map(color => typeof color === 'string' ? color : color.color) || []);
            // Initialize fileList with existing product images
            const existingImages = product.images?.map(image => ({
                uid: image.id || Math.random().toString(36).substring(7), // Use a unique ID
                name: image.imageUrl.substring(image.imageUrl.lastIndexOf('/') + 1), // Extract file name
                status: 'done',
                url: image.imageUrl,
            })) || [];
            setFileList(existingImages);
            // Initialize uploadedImageUrls with existing product images
            setUploadedImageUrls(existingImages.map(img => img.url));
        }
    }, [product, form]);

    const handleColorInputChange = (e) => {
        setColorInputValue(e.target.value);
    };

    const handleColorInputConfirm = () => {
        if (colorInputValue && colors.indexOf(colorInputValue) === -1) {
            setColors([...colors, colorInputValue]);
        }
        setColorInputVisible(false);
        setColorInputValue("");
    };

    const handleRemoveColor = (removedColor) => {
        const updatedColors = colors.filter(color => color !== removedColor);
        setColors(updatedColors);
    };

    // --- Image Upload Logic ---
    const handleUploadChange = ({ file, fileList: newFileList }) => {
        setFileList(newFileList);

        if (file.status === 'done') {
            // Add the URL from the upload response to uploadedImageUrls
            setUploadedImageUrls(prevUrls => [...prevUrls, file.response.url]);
            notification.success({
                message: "Upload thành công",
                description: `${file.name} đã được tải lên.`,
            });
        } else if (file.status === 'error') {
            notification.error({
                message: "Upload thất bại",
                description: `${file.name} tải lên không thành công.`,
            });
        }
    };

    const handleRemoveImage = (file) => {
        // Remove the URL from uploadedImageUrls when an image is removed from the list
        setUploadedImageUrls(prevUrls => prevUrls.filter(url => url !== file.url));
    };

    // Custom request to upload images to your backend / Cloudinary
    const customUploadRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' is the key your backend expects

        try {
            const response = await fetch(`${BASE_URL}/api/upload`, { // Your upload endpoint
                method: 'POST',
                body: formData,
                // Add any necessary headers like Authorization if your upload API requires it
                // headers: {
                //    'Authorization': `Bearer ${yourAuthToken}`
                // }
            });

            if (response.ok) {
                const data = await response.json();
                // Assuming your upload API returns a JSON object with a 'url' field
                onSuccess({ url: data.url, name: file.name, status: 'done' }, file);
            } else {
                const errorData = await response.json();
                onError(new Error(errorData.message || 'Upload failed'));
            }
        } catch (error) {
            console.error("Upload error:", error);
            onError(error);
        }
    };
    // --- End Image Upload Logic ---


    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const productData = {
                name: values.name,
                price: values.price,
                description: values.description,
                categoryId: values.categoryId,
                discount: values.discount || 0,
                brand: values.brand,
                model: values.model,
                available: values.available === undefined ? 1 : values.available,
                colors: colors,
                // Send the collected image URLs to the backend
                images: uploadedImageUrls,
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

            const result = await updateProduct(product.id, productData);

            notification.success({
                message: "Thành công",
                description: "Sản phẩm đã được cập nhật thành công",
            });

            form.resetFields();
            setColors([]);
            setFileList([]);
            setUploadedImageUrls([]); // Clear uploaded image URLs

            if (onOk) onOk();
            onCancel();
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: error.message || "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
            });
            console.error("Error updating product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa sản phẩm"
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
                    Sửa sản phẩm
                </Button>,
            ]}
        >
            <div className="modal-content">
                <Form form={form} layout="vertical" name="edit_product_form" initialValues={{ available: 1 }}>
                    <Divider orientation="left">Thông tin cơ bản</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[
                                    { required: true, message: "Vui lòng nhập tên sản phẩm" },
                                    { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự" },
                                    { max: 200, message: "Tên sản phẩm không được quá 200 ký tự" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá (VNĐ)"
                                rules={[
                                    { required: true, message: "Vui lòng nhập giá sản phẩm" },
                                    // Custom validator để kiểm tra giá trị số sau khi đã được parser
                                    {
                                        validator: async (_, value) => {

                                            const numValue = Number(value); // Đảm bảo giá trị là số
                                            if (isNaN(numValue)) {
                                                return Promise.reject(new Error('Giá phải là một số hợp lệ!'));
                                            }
                                            if (numValue <= 0) {
                                                return Promise.reject(new Error('Giá sản phẩm phải lớn hơn 0'));
                                            }
                                            if (numValue > 1000000000) {
                                                return Promise.reject(new Error('Giá sản phẩm không được vượt quá 1 tỷ'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
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
                            <Form.Item name="available" label="Trạng thái">
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

                    {/* Màu sắc - cho phép thêm/xóa */}
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

                    {/* Hình ảnh - cho phép cập nhật */}
                    <Form.Item
                        label="Hình ảnh"
                        valuePropName="fileList"
                        getValueFromEvent={e => e.fileList} // This is important for Ant Design Form.Item with Upload
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            customRequest={customUploadRequest} // Use your custom upload function
                            onChange={handleUploadChange}
                            onRemove={handleRemoveImage} // Handle image removal
                            accept="image/*" // Restrict to image files
                        >
                            {fileList.length < 8 && ( // Limit to 8 images, adjust as needed
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default EditProductModal;