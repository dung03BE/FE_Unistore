import React, { useState } from 'react';
import { forgotPasswordApi } from '../../services/userService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        try {
            await forgotPasswordApi(email);
            setMessage('Link lấy lại mật khẩu đã được gửi về mail của bạn.');
            setEmail(''); // Clear the form after successful submission
        } catch (err) {
            setError('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
            console.error('Error sending forgot password email:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Lấy lại mật khẩu của bạn</h2>
                    <p style={styles.subtitle}>
                        Vui lòng nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>
                            Địa chỉ email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi'}
                        </button>
                    </div>
                </form>

                {message && (
                    <div style={styles.successMessage}>
                        <div style={styles.messageContent}>
                            <span style={styles.successIcon}>✓</span>
                            <p style={styles.successText}>{message}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={styles.errorMessage}>
                        <div style={styles.messageContent}>
                            <span style={styles.errorIcon}>✕</span>
                            <p style={styles.errorText}>{error}</p>
                        </div>
                    </div>
                )}

                <div style={styles.footer}>
                    <a href="/login" style={styles.link}>
                        Quay lại trang đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
    },
    container: {
        width: '100%',
        maxWidth: '450px',
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '25px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '12px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginTop: '0',
    },
    form: {
        width: '100%',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#444',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        border: '1px solid #d1d1d1',
        borderRadius: '5px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buttonDisabled: {
        backgroundColor: '#80b5e6',
        cursor: 'not-allowed',
    },
    successMessage: {
        padding: '12px',
        backgroundColor: '#e6f7e9',
        border: '1px solid #c3e6cb',
        borderRadius: '5px',
        marginTop: '20px',
    },
    errorMessage: {
        padding: '12px',
        backgroundColor: '#fae7e6',
        border: '1px solid #f5c6cb',
        borderRadius: '5px',
        marginTop: '20px',
    },
    messageContent: {
        display: 'flex',
        alignItems: 'center',
    },
    successIcon: {
        marginRight: '10px',
        color: '#28a745',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    errorIcon: {
        marginRight: '10px',
        color: '#dc3545',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    successText: {
        margin: '0',
        color: '#28a745',
        fontSize: '15px',
    },
    errorText: {
        margin: '0',
        color: '#dc3545',
        fontSize: '15px',
    },
    footer: {
        marginTop: '25px',
        textAlign: 'center',
    },
    link: {
        color: '#007BFF',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
    },
};

export default ForgotPassword;