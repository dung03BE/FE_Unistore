import React, { useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Modal, Form, Select, message, Space, Spin, DatePicker, Tooltip } from 'antd';
import { getToken } from '../services/localStorageService';
import moment from 'moment';
import { postUserApi } from '../services/userService';
import ReCAPTCHA from 'react-google-recaptcha';
const { Option } = Select;
import { BASE_URL } from "../config";
const roleNames = {
    1: 'Admin',
    2: 'User',
    3: 'Employee',
};

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToUpdateRole, setUserToUpdateRole] = useState(null);
    const [roleForm] = Form.useForm();
    const [selectedRole, setSelectedRole] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const recaptchaRef = useRef(null);
    const [captchaValue, setCaptchaValue] = useState(null);
    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset(); // Gọi phương thức reset của ReCAPTCHA
            setCaptchaValue(null); // Đặt lại giá trị captcha trong state
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        handleRoleFilter(selectedRole);
    }, [users, selectedRole]);

    const fetchUsers = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            message.error('Không tìm thấy token đăng nhập.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/v1/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Lỗi khi lấy danh sách người dùng:", errorData);
                message.error("Không thể tải danh sách người dùng.");
                return;
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Lỗi mạng khi lấy danh sách người dùng:", error);
            message.error("Lỗi mạng, không thể tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
        setEditingUser(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        form.resetFields();
        resetRecaptcha();
    };

    const handleCreateUser = async (values) => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            message.error('Không tìm thấy token đăng nhập.');
            setLoading(false);
            return;
        }
        try {

            const formattedValues = {
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                password: values.password,
                retype_password: values.retypePassword,
                // Đảm bảo values.dateOfBirth là đối tượng moment hoặc Date để format
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                roleId: values.roleId,
                email: values.email,
                recaptcha: captchaValue, // Thêm giá trị captcha vào đây
            };

            console.log("Payload:", formattedValues);

            const response = await postUserApi(formattedValues); // Sử dụng hàm postUserApi

            console.log("Response Data:", response); // Log the response data

            if (response.code === 1000) { // Kiểm tra code thành công
                message.success('Tạo người dùng thành công!');
                // navigate('/login'); // Bỏ comment nếu bạn muốn chuyển hướng sau khi đăng ký thành công
                await fetchUsers(); // Giữ lại logic fetchUsers nếu cần cập nhật danh sách
                setIsModalOpen(false); // Đóng modal nếu cần
                form.resetFields(); // Reset form
                resetRecaptcha();
            } else if (response.code === 1002) {
                message.error('Số điện thoại đã tồn tại!');
                resetRecaptcha();
            } else if (response.code === 1008) {
                // Cập nhật trường lỗi cụ thể nếu message trả về từ backend liên quan đến dateOfBirth
                // hoặc một trường nào đó
                form.setFields([{
                    name: 'dateOfBirth', // Hoặc trường nào khác mà lỗi 1008 đề cập
                    errors: [response.message],
                }]);
                message.error(response.message); // Hiển thị thông báo lỗi chung
                resetRecaptcha();
            } else if (response.code === 1015) {
                message.error('Email đã tồn tại!');
                resetRecaptcha();
            } else {
                message.error('Đăng ký thất bại. Vui lòng thử lại.');
                resetRecaptcha();
            }
        } catch (error) {
            console.error('Lỗi khi tạo người dùng:', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
            resetRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (values) => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            message.error('Không tìm thấy token đăng nhập.');
            setLoading(false);
            return;
        }
        console.log("Update User Payload:", values);
        try {
            const response = await fetch(`${BASE_URL}/api/v1/users/updateByAdmin/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });
            const responseData = await response.json(); // Lấy dữ liệu response

            if (!response.ok) {
                if (responseData && responseData.code === 1008) {
                    form.setFields([{
                        name: 'dateOfBirth',
                        errors: [responseData.message],
                    }]);
                } else {
                    console.error("Lỗi khi cập nhật người dùng:", responseData);
                    message.error(responseData.Message || "Không thể cập nhật người dùng.");
                    resetRecaptcha();
                }
                return;
            }
            message.success('Cập nhật người dùng thành công.');
            await fetchUsers();
            setIsModalOpen(false);
            setEditingUser(null);
            form.resetFields();
        } catch (error) {
            console.error("Lỗi mạng khi cập nhật người dùng:", error);
            message.error("Lỗi mạng, không thể cập nhật người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            setLoading(true);
            const token = getToken();
            if (!token) {
                message.error('Không tìm thấy token đăng nhập.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Lỗi khi xóa người dùng:", errorData);
                    message.error("Không thể xóa người dùng.");
                    return;
                }
                message.success('Xóa người dùng thành công.');
                await fetchUsers();
            } catch (error) {
                console.error("Lỗi mạng khi xóa người dùng:", error);
                message.error("Lỗi mạng, không thể xóa người dùng.");
            } finally {
                setLoading(false);
            }
        }
    };

    const onEditUser = (record) => {
        setEditingUser(record);
        const formattedRecord = {
            ...record,
            dateOfBirth: record.dateOfBirth ? moment(record.dateOfBirth) : null
        };
        form.setFieldsValue(formattedRecord);
        setIsModalOpen(true);
    };

    const showRoleModal = (record) => {
        setUserToUpdateRole(record);
        roleForm.setFieldsValue({ roleId: record.roleId });
        setIsRoleModalOpen(true);
    };

    const handleRoleModalCancel = () => {
        setIsRoleModalOpen(false);
        setUserToUpdateRole(null);
        roleForm.resetFields();
    };

    const handleUpdateUserRole = async (values) => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            message.error('Không tìm thấy token đăng nhập.');
            setLoading(false);
            return;
        }
        try {
            const payload = {
                roleId: values.roleId,
            };
            console.log("Payload:", payload);
            const response = await fetch(`${BASE_URL}/api/v1/users/id/${userToUpdateRole.id}/${payload.roleId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Lỗi khi cập nhật role cho người dùng:", errorData);
                message.error("Không thể cập nhật role cho người dùng.");
                return;
            }
            message.success(`Cập nhật role cho người dùng ${userToUpdateRole.fullName} thành công.`);
            await fetchUsers();
            setIsRoleModalOpen(false);
            setUserToUpdateRole(null);
            roleForm.resetFields();
        } catch (error) {
            console.error("Lỗi mạng khi cập nhật role cho người dùng:", error);
            message.error("Lỗi mạng, không thể cập nhật role cho người dùng.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        if (role) {
            const filtered = users.filter(user => user.roleId === role);
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: {
                showTitle: false, // Không hiển thị tooltip mặc định
            },
            render: address => (
                <span style={{ cursor: 'pointer' }}>
                    <Tooltip placement="topLeft" title={address}>
                        {address}
                    </Tooltip>
                </span>
            ),
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '',
        },
        {
            title: 'Role',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId) => roleNames[roleId] || `Unknown Role (${roleId})`,
            filters: Object.entries(roleNames).map(([value, text]) => ({
                text,
                value: parseInt(value),
            })),
            onFilter: (value, record) => record.roleId === value,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button onClick={() => onEditUser(record)}>Sửa</Button>
                    <Button onClick={() => showRoleModal(record)}>Đổi Role</Button>
                    <Button danger onClick={() => handleDeleteUser(record.id)}>Xóa</Button>
                </Space>
            ),
        },

    ];

    return (
        <div>
            <h2>Quản lý Người Dùng</h2>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button type="primary" onClick={showModal}>
                    Thêm người dùng
                </Button>
                <Select
                    placeholder="Lọc theo Role"
                    onChange={handleRoleFilter}
                    style={{ width: 200 }}
                    allowClear
                >
                    <Option value={null}>Tất cả</Option>
                    {Object.entries(roleNames).map(([value, text]) => (
                        <Option key={value} value={parseInt(value)}>{text}</Option>
                    ))}
                </Select>
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table dataSource={filteredUsers.length > 0 ? filteredUsers : users} columns={columns} rowKey="id" />
            )}

            {/* Modal for Adding/Editing User Information */}
            <Modal
                title={editingUser ? "Sửa người dùng" : "Thêm người dùng"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            try {
                                const values = await form.validateFields();
                                if (editingUser) {
                                    await handleUpdateUser(values);
                                } else {
                                    await handleCreateUser(values);
                                }
                            } catch (errorInfo) {
                                console.log('Validate Failed:', errorInfo);
                            }
                        }}
                    >
                        {editingUser ? "Lưu" : "Thêm"}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={editingUser ? {
                        fullName: editingUser.fullName,
                        phoneNumber: editingUser.phoneNumber,
                        address: editingUser.address,
                        roleId: editingUser.roleId,
                        email: editingUser.email,
                        dateOfBirth: editingUser.dateOfBirth ? moment(editingUser.dateOfBirth) : null,
                    } : null}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^\d{10}$/, message: 'Số điện thoại phải có đúng 10 số!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    {!editingUser && (
                        <>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    {
                                        pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
                                        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="retypePassword"
                                label="Nhập lại mật khẩu"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập lại mật khẩu!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                    )}
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="dateOfBirth"
                        label="Ngày sinh"
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item
                        name="roleId"
                        label="Role"
                        rules={[{ required: true, message: 'Vui lòng chọn Role!' }]}
                        initialValue={!editingUser ? 2 : undefined} // Mặc định là User (2) khi thêm mới
                    >
                        <Select>
                            {!editingUser ? (
                                // Chỉ hiển thị role User khi thêm người dùng mới
                                <Option value={2}>{roleNames[2]}</Option>
                            ) : (
                                // Hiển thị tất cả roles khi sửa người dùng
                                <>
                                    <Option value={1}>{roleNames[1]}</Option>
                                    <Option value={2}>{roleNames[2]}</Option>
                                    <Option value={3}>{roleNames[3]}</Option>
                                </>
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                type: 'email',
                                message: 'Email không hợp lệ!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <ReCAPTCHA
                            sitekey="6LeNoEErAAAAALvbfhqpIPXRN4fN5if_s-R4kQ0d" // ← thay bằng site key từ Google
                            onChange={(value) => setCaptchaValue(value)}
                            ref={recaptchaRef}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Updating User Role */}
            <Modal
                title={`Cập nhật Role cho ${userToUpdateRole?.fullName}`}
                open={isRoleModalOpen}
                onCancel={handleRoleModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleRoleModalCancel}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={async () => {
                            try {
                                const values = await roleForm.validateFields();
                                await handleUpdateUserRole(values);
                            } catch (errorInfo) {
                                console.log('Validate Failed:', errorInfo);
                            }
                        }}
                    >
                        Lưu Role
                    </Button>,
                ]}
            >
                <Form form={roleForm} layout="vertical">
                    <Form.Item
                        name="roleId"
                        label="Role mới"
                        rules={[{ required: true, message: 'Vui lòng chọn Role mới!' }]}
                        initialValue={userToUpdateRole?.roleId}
                    >
                        <Select>
                            <Option value={1}>{roleNames[1]}</Option>
                            <Option value={2}>{roleNames[2]}</Option>
                            <Option value={3}>{roleNames[3]}</Option>
                            {/* Add more roles if needed */}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default UserManagement;