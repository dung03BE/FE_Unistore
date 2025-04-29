import React, { useState, useEffect } from 'react';
import { resetPasswordApi } from '../../services/userService';
import './ResetPassword.scss'; // Import file SCSS

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-3 for strength levels

    useEffect(() => {
        // Lấy token từ URL (ví dụ: ?token=abcdef)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        setToken(urlToken);

        if (!urlToken) {
            setMessage('Token không hợp lệ hoặc đã hết hạn');
            setMessageType('error');
        }
    }, []);

    // Kiểm tra độ mạnh của mật khẩu
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++; // Độ dài
        if (/[A-Z]/.test(password)) strength++; // Chữ hoa
        if (/[0-9]/.test(password)) strength++; // Số
        if (/[^A-Za-z0-9]/.test(password)) strength++; // Ký tự đặc biệt
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        checkPasswordStrength(newPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Kiểm tra mật khẩu
        if (password.length < 8) {
            setMessage('Mật khẩu phải có ít nhất 8 ký tự');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            setMessageType('error');
            return;
        }

        if (!token) {
            setMessage('Token không hợp lệ hoặc đã hết hạn');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await resetPasswordApi(token, password);
            setMessage(res.message || 'Đặt lại mật khẩu thành công');
            setMessageType('success');

            // Xóa form sau khi thành công
            setPassword('');
            setConfirmPassword('');
            setPasswordStrength(0);

            // Tự động chuyển hướng sau 3 giây
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStrengthLabel = () => {
        switch (passwordStrength) {
            case 0: return 'Yếu';
            case 1: return 'Yếu';
            case 2: return 'Trung bình';
            case 3: return 'Khá';
            case 4: return 'Mạnh';
            default: return '';
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return '#f44336';
            case 1: return '#f44336';
            case 2: return '#ff9800';
            case 3: return '#2196f3';
            case 4: return '#4caf50';
            default: return '#ccc';
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-container">
                <div className="reset-header">
                    <h2 className="reset-title">Đặt lại mật khẩu</h2>
                    <p className="reset-subtitle">
                        Vui lòng nhập mật khẩu mới của bạn
                    </p>
                </div>

                {!token ? (
                    <div className="message error">
                        <div className="message-content">
                            <span className="message-icon">⚠️</span>
                            <p className="message-text">Token không hợp lệ hoặc đã hết hạn</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="form-group">
                            <label className="form-label">Mật khẩu mới:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                                className="form-input"
                                placeholder="Nhập mật khẩu mới"
                            />
                            {password && (
                                <div className="password-strength">
                                    <div className="strength-bar-container">
                                        <div
                                            className="strength-bar"
                                            style={{
                                                width: `${(passwordStrength / 4) * 100}%`,
                                                backgroundColor: getStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span className="strength-label" style={{ color: getStrengthColor() }}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                            )}
                            <p className="password-hint">
                                Mật khẩu phải có ít nhất 8 ký tự và nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Xác nhận mật khẩu:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={`form-input ${confirmPassword && password !== confirmPassword ? 'input-error' : ''}`}
                                placeholder="Nhập lại mật khẩu"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="input-error-text">Mật khẩu không khớp</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`reset-button ${isLoading ? 'button-disabled' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                {message && (
                    <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
                        <div className="message-content">
                            <span className="message-icon">
                                {messageType === 'success' ? '✓' : '✕'}
                            </span>
                            <p className="message-text">
                                {message}
                                {messageType === 'success' && (
                                    <span className="redirect-text"> Đang chuyển hướng đến trang đăng nhập...</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <div className="reset-footer">
                    <a href="/login" className="reset-link">
                        Quay lại trang đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;