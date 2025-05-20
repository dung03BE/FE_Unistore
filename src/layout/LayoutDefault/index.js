import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./LayoutDefault.scss";
import CartMini from "../../components/CartMini";
import logo from '../../images/Logo2.png';
import bct from '../../images/bct.svg';
import { BellOutlined, RestOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import {
    faUser, faMagnifyingGlass, faCartShopping,
    faLocationDot, faPhone, faEnvelope, faSignOutAlt, faCog, faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Login from "../../components/Login";
import { useEffect, useRef, useState } from "react";
import { getToken, removeToken } from "../../services/localStorageService";
import { setUserDetails as setUserDetailsAction } from '../../actions/user.js'; // Tạo action setUserDetails
import { useDispatch } from "react-redux";
import { persistor } from "../../store.js";
import GreenPhone from "../../components/GreenPhone/GreenPhone.js";
import { getAnnounceByUserId, updateStatusAnnounceByUseId } from "../../services/announceService.js";
import { getProfile } from "../../services/authenticationService.js";




const handleOpenLocation = () => {
    // OpenLocation implementation
};

function LayoutDefault() {
    const [userDetails, setUserDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false); // State hiển thị thông báo
    const [announcements, setAnnouncements] = useState([]); // State lưu trữ thông báo
    useEffect(() => {
        const accessToken = getToken();

        if (!accessToken) {
            // Không chuyển hướng nếu không có token
            setIsLoading(false);
            return;
        }

        const getUserDetails = async () => {
            try {
                const data = await getProfile(); // await để đợi kết quả
                setUserDetails(data);
                dispatch(setUserDetailsAction(data));
            } catch (error) {
                console.error("Error fetching user details:", error);
                // Xóa token không hợp lệ nhưng không chuyển hướng
                removeToken();
            } finally {
                setIsLoading(false);
            }
        };

        getUserDetails();
        // api thong báo
        const fetchAnnouncements = async () => {
            try {
                const data = await getAnnounceByUserId();
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                } else {
                    setAnnouncements([]);
                }
                // setAnnouncements(data);
                console.log("Thông báo:", data);
            } catch (error) {
                console.error("Lỗi khi lấy thông báo:", error);
            }
        };
        fetchAnnouncements();

        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        removeToken();
        setUserDetails(null);
        persistor.purge();
        setShowDropdown(false);
        window.location.reload();
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };


    const toggleNotifications = async () => {
        if (!showNotifications) {
            try {
                await updateStatusAnnounceByUseId();

                setAnnouncements(prevAnnouncements =>
                    prevAnnouncements.map(announcement => ({
                        ...announcement,
                        isRead: true,
                    }))
                );
            } catch (error) {
                console.error("Lỗi khi cập nhật trạng thái thông báo:", error);

            }
        }
        setShowNotifications(!showNotifications);
    };
    // Hiển thị loader trong khi đang kiểm tra đăng nhập
    if (isLoading) {
        return <div className="layout-loading">Đang tải...</div>;
    }
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate("/");
        }
    };

    const NotificationDropdown = () => (
        <div className="notification-dropdown">
            {announcements.map((announcement) => (
                <div key={announcement.id} className={`notification-item ${!announcement.isRead ? 'unread' : ''}`}>
                    <h2>{announcement.title}</h2>
                    <p>{announcement.content}</p>
                    <p> {announcement.createdAt}</p>
                </div>
            ))}
        </div>
    );

    const unreadCount = announcements.filter(announcement => !announcement.isRead).length;

    return (
        <>
            <div className="layout-default">
                <header className="layout-default__header">
                    <div className="layout-default__logo">
                        <a href="/">
                            <img
                                src={logo}
                                alt="Company Logo"
                                className="h-12 w-auto"
                            />
                        </a>
                    </div>

                    <form
                        action="/tim-kiem"
                        onSubmit={handleSearch}
                        className="layout-default__search"
                    >
                        <input
                            id="skw"
                            type="text"
                            className="input-search"
                            placeholder="Bạn tìm gì..."
                            name="key"
                            autoComplete="off"
                            maxLength={100}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" aria-label="button suggest search">
                            <i className="icon-search"><FontAwesomeIcon icon={faMagnifyingGlass} /></i>
                        </button>
                        <div id="search-result"></div>
                    </form>

                    <div className="layout-default_profile" ref={dropdownRef}>
                        {userDetails ? (
                            // User đã đăng nhập - hiển thị dropdown
                            <div className="user-profile-dropdown">
                                <div className="user-profile-button" onClick={toggleDropdown}>
                                    <FontAwesomeIcon icon={faUserCircle} />
                                    <span>{userDetails.fullName}</span>

                                </div>

                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <NavLink to="/profile" onClick={() => setShowDropdown(false)}>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span>Trang cá nhân</span>
                                        </NavLink>
                                        <NavLink to="/settings" onClick={() => setShowDropdown(false)}>
                                            <FontAwesomeIcon icon={faCog} />
                                            <span>Cài đặt</span>
                                        </NavLink>
                                        <button onClick={handleLogout}>
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                        ) : (
                            // User chưa đăng nhập - hiển thị nút login
                            <NavLink to="/login" className="name-order active">
                                <FontAwesomeIcon icon={faUser} />
                                <span>Đăng nhập</span>
                            </NavLink>
                        )}

                    </div>

                    <div className="layout-default__cart">
                        <FontAwesomeIcon icon={faCartShopping} />
                        <CartMini />
                    </div>
                    <div className="layout-default__recyling">
                        <NavLink to="/recycling">
                            <SyncOutlined />
                            <span className="title__recycling">
                                Điện thoại xanh
                            </span>
                        </NavLink>
                    </div>
                    <div className="layout-default__announce">
                        <BellOutlined onClick={toggleNotifications} />

                        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                        {showNotifications && <NotificationDropdown />}
                    </div>

                </header>
                <main className="layout-default__main">
                    <Outlet />
                </main>
                <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
                {/* <df-messenger
                    intent="WELCOME"
                    chat-title="Chatbot"
                    agent-id="a839014e-a81d-4020-9d8c-93cdfee22954"
                    language-code="en"
                ></df-messenger> */}
                <footer className="layout-default__footer">
                    <div className="layout-default__infor">
                        <h4>Cửa hàng Uni</h4>
                        <span>
                            <FontAwesomeIcon icon={faLocationDot} />
                        </span>
                        <p>Số 1 Hoàng Công Chất, Phú Diễn, Nam Từ Liêm, Hà Nội, Việt Nam</p>

                        <span>
                            <FontAwesomeIcon icon={faPhone} />
                        </span>

                        <p>0399999999</p>
                        <span>
                            <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                        <p>support@dungnc11.com</p>
                        <span>
                            <img src={bct} alt="Bộ Công Thương" />
                        </span>
                    </div>
                    <div className="layout-default__policy">
                        <img src={logo} alt="logo" />
                        <span>Chis Tech Meets You</span>
                        <p><a href="#">Tuyển dụng</a></p>
                        <p><a href="#">Chính sách bảo mật</a></p>
                        <p><a href="#">Điều khoản sử dụng</a></p>
                        <p><a href="#">Liên hệ hợp tác</a></p>
                        <p><a href="#">Câu hỏi thường gặp</a></p>
                    </div>
                    <div className="layout-default__contact">
                        <h4>Liên hệ hỗ trợ</h4>
                        <p><a href="#"><FontAwesomeIcon icon={faFacebookF} />Facebook</a></p>
                        <p><a href="#"><FontAwesomeIcon icon={faInstagram} />Instagram</a></p>
                        <p><a href="#"><FontAwesomeIcon icon={faTwitter} />Twitter</a></p>
                        <div className="layout-default__end">
                            <span>© 2024 Chis </span>
                        </div>
                    </div>

                </footer>
            </div>
        </>
    );
}

export default LayoutDefault;
