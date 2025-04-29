import { Avatar, Button, DatePicker, Input, Modal, Row, Col, message } from "antd";
import "../Profile/PersonalInfo.scss";
import { UserOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react"; // Import useEffect
import dayjs from "dayjs";
import { changePasswordApi, putUserApi } from "../../services/userService";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../actions/user";

export const PersonalInfo = ({ userDetails }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dob, setDob] = useState(userDetails?.dateOfBirth ? dayjs(userDetails.dateOfBirth) : null);
    const [fullName, setFullName] = useState(userDetails?.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber || "");
    const [address, setAddress] = useState(userDetails?.address || "");
    const [email, setEmail] = useState(userDetails?.email || "");
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [retypeNewPassword, setRetypeNewPassword] = useState("");
    const dispatch = useDispatch();
    useEffect(() => {
        if (userDetails) {
            setFullName(userDetails.fullName || "");
            setPhoneNumber(userDetails.phoneNumber || "");
            setAddress(userDetails.address || "");
            setEmail(userDetails.email || "");
            setDob(userDetails.dateOfBirth ? dayjs(userDetails.dateOfBirth) : null);
        }
    }, [userDetails]);

    if (!userDetails) return <div>Loading...</div>;

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        handleUpdateUser();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleUpdateUser = async () => {
        try {
            const updatedUserData = {
                fullName: fullName, // Thay đổi fullName thành full_name
                phoneNumber: phoneNumber, // Thay đổi phoneNumber thành phone_number
                address,
                email,
                dateOfBirth: dob.toDate(),
            };

            const response = await putUserApi(updatedUserData);

            if (response) {
                dispatch(setUserDetails(response));
                message.success("Cập nhật thông tin thành công!");
            } else {
                throw new Error("Không nhận được dữ liệu từ API");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            message.error("Cập nhật thông tin thất bại!");
        }

    };
    // Hàm hiển thị Modal đổi mật khẩu
    const showChangePasswordModal = () => {
        setIsChangePasswordModalOpen(true);
    };

    // Hàm xử lý khi nhấn OK trong Modal đổi mật khẩu
    const handleChangePasswordOk = () => {
        // Xử lý logic đổi mật khẩu ở đây
        handlePassword();
        setIsChangePasswordModalOpen(false);
    };

    // Hàm xử lý khi nhấn Cancel trong Modal đổi mật khẩu
    const handleChangePasswordCancel = () => {
        setIsChangePasswordModalOpen(false);
    };
    const handlePassword = async () => {
        try {
            // Validate mật khẩu
            if (newPassword !== retypeNewPassword) {
                message.error("Mật khẩu mới và nhập lại mật khẩu không khớp!");
                return;
            }

            const changePWUser = {
                password: newPassword,
                retype_password: retypeNewPassword,
                old_password: oldPassword,
            };

            const response = await changePasswordApi(changePWUser);
            console.log("rs:", response);
            if (response.code !== 1000) {
                message.error("Đổi mật khẩu thất bại");
                return;
            }

            message.success("Đổi mật khẩu thành công");
        } catch (error) {
            console.log("Error from changePasswordApi:", error);
            // Xử lý lỗi từ API
            if (error.status === 400 && error.data) {
                message.error("Mật khẩu cũ không đúng");
            } else {
                message.error("Đổi mật khẩu thất bại");
            }
        }
    };
    return (
        <div className="personal">
            <Avatar size={64} icon={<UserOutlined />} />
            <h2>Thông tin cá nhân</h2>
            <p><strong>Họ và tên:</strong> {userDetails.fullName}</p>
            <p><strong>Số điện thoại:</strong> {userDetails.phoneNumber}</p>
            <p><strong>Địa chỉ:</strong> {userDetails.address}</p>
            <p><strong>Ngày sinh:</strong> {new Date(userDetails.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <div className="editPersonal">
                <Button type="primary" danger onClick={showModal} >
                    Chỉnh sửa thông tin
                </Button>
                <Button type="primary" onClick={showChangePasswordModal} style={{ marginLeft: '10px' }}>
                    Đổi mật khẩu
                </Button>

                <Modal
                    title={
                        <span style={{ fontSize: "27px" }}>
                            Chỉnh sửa thông tin cá nhân của bạn:
                        </span>
                    }
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={900}

                >
                    <Row gutter={16}>
                        <Col span={12}> {/* Cột trái */}
                            <p>Họ và tên:</p>
                            <Input
                                placeholder="Nhập tên của bạn..."
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: "400px", height: "40px", fontSize: "16px" }}
                            />
                            <p>Số điện thoại:</p>
                            <Input
                                placeholder="Sdt..."
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                style={{ width: "200px", height: "40px", fontSize: "16px" }}
                            />
                            <p>Địa chỉ:</p>
                            <Input
                                placeholder=""
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                style={{ width: "400px", height: "40px", fontSize: "16px" }}
                            />
                            <p>Ngày sinh:</p>
                            <DatePicker
                                value={dob}
                                onChange={(date) => setDob(date)}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sinh"
                            />
                            <p>Email:</p>
                            <Input
                                placeholder=""
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "300px", height: "40px", fontSize: "16px" }}
                            />
                        </Col>

                    </Row>
                </Modal>
                <Modal
                    title={
                        <span style={{ fontSize: "27px" }}>
                            Đổi mật khẩu:
                        </span>
                    }
                    open={isChangePasswordModalOpen}
                    onOk={handleChangePasswordOk}
                    onCancel={handleChangePasswordCancel}
                    width={600}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <p>Mật khẩu cũ:</p>
                            <Input.Password placeholder="Nhập mật khẩu cũ"
                                style={{ width: "300px", height: "40px", fontSize: "16px" }} value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)} />
                            <p>Mật khẩu mới:</p>
                            <Input.Password placeholder="Nhập mật khẩu mới"
                                style={{ width: "300px", height: "40px", fontSize: "16px" }} value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p>Nhập lại mật khẩu mới:</p>
                            <Input.Password placeholder="Nhập lại mật khẩu mới"
                                style={{ width: "300px", height: "40px", fontSize: "16px" }} value={retypeNewPassword}
                                onChange={(e) => setRetypeNewPassword(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Modal>
            </div>
        </div >
    );
};