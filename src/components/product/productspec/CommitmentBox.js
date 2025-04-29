import React from 'react';
import './CommitmentBox.scss'; // Import file CSS nếu cần

function CommitmentBox() {
    return (
        <div className="commitment-box">
            <div className="commitment-title">Công ty chúng tôi cam kết</div>
            <div className="commitment-items">
                <div className="commitment-item">
                    <div className="commitment-icon"></div>
                    <div className="commitment-text">
                        Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C
                    </div>
                </div>
                <div className="commitment-item">
                    <div className="commitment-icon"></div>
                    <div className="commitment-text">
                        Hư gì đổi nấy 12 tháng tại 2961 siêu thị toàn quốc (miễn phí tháng đầu) <a href="#">Xem chi tiết</a>
                    </div>
                </div>
                <div className="commitment-item">
                    <div className="commitment-icon">️</div>
                    <div className="commitment-text">
                        Bảo hành chính hãng điện thoại 1 năm tại các trung tâm bảo hành hãng <a href="#">Xem địa chỉ bảo hành</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommitmentBox;