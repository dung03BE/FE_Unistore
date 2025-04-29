import React, { useRef, useState } from 'react';
import { Form, Input, Button, DatePicker, message, Typography, Card, Space, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined, PhoneOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { postUserApi } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const { Title, Text } = Typography;

function Register() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    const [captchaValue, setCaptchaValue] = useState(null);
    const onFinish = async (values) => {
        try {
            const formattedValues = {
                ...values,
                dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
                recaptcha: captchaValue, // Thêm giá trị captcha
            };

            const response = await postUserApi(formattedValues);

            if (response.code === 1000) { // Kiểm tra code thành công
                message.success('Đăng ký thành công!');
                navigate('/login');
            } else if (response.code === 1002) {
                message.error('Số điện thoại đã tồn tại!');
            }
            else if (response.code === 1008) {
                message.error(response.message);
            }
            else if (response.code === 1008) {
                message.error(response.message);
            } else if (response.code === 1015) {
                message.error('Email đã tồn tại!');
            } else {
                message.error('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
    };

    return (
        <div style={{
            maxWidth: 800,
            margin: '20px auto',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Card
                style={{ width: '100%' }}
                bordered={true}
                className="register-card"
                bodyStyle={{ padding: '20px' }}
                hoverable

            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 5 }}>Đăng Ký Tài Khoản</Title>
                        <Text type="secondary">Vui lòng điền đầy đủ thông tin để tạo tài khoản</Text>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark="optional"
                        scrollToFirstError
                        size="large" // cỡ chữ

                    >
                        <Row gutter={20}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined className="site-form-item-icon" />}
                                        placeholder="Nhập số điện thoại của bạn"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Họ và tên"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined className="site-form-item-icon" />}
                                        placeholder="Nhập họ và tên của bạn"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input
                                prefix={<HomeOutlined className="site-form-item-icon" />}
                                placeholder="Nhập địa chỉ của bạn"
                            />
                        </Form.Item>

                        <Row gutter={20}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="Nhập mật khẩu của bạn"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Nhập lại mật khẩu"
                                    name="retype_password"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                        placeholder="Xác nhận mật khẩu của bạn"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={20}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        suffixIcon={<CalendarOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { type: 'email', message: 'Email không hợp lệ!' },
                                        { required: true, message: 'Vui lòng nhập email!' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined className="site-form-item-icon" />}
                                        placeholder="Nhập email của bạn"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <ReCAPTCHA
                                sitekey="6LfsghIrAAAAAJYV-bXQP5O5pJ_0kFo338qY-g3L" // ← thay bằng site key từ Google
                                onChange={(value) => setCaptchaValue(value)}
                                ref={recaptchaRef}
                            />
                        </Form.Item>
                        <Form.Item style={{ marginTop: 12 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%', height: 40 }}
                            >
                                Đăng Ký Ngay
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <Text type="secondary">
                                Đã có tài khoản?{' '}
                                <a onClick={() => navigate('/login')} style={{ fontWeight: 'bold' }}>
                                    Đăng nhập ngay
                                </a>
                            </Text>
                        </div>
                    </Form>
                </Space>
            </Card>
        </div>
    );
}

export default Register;