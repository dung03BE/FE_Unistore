import React, { useState } from 'react';
import { Carousel, Typography, Card, Steps, Button, Collapse, Divider, List, Form, Input, message, Select, Modal, Space } from 'antd';
import "../GreenPhone/GreenPhone.scss";
import thugom from '../../images/thugom.png';
import vntaiche from '../../images/vntaiche.jpg';
import { CheckCircleOutlined, DatabaseTwoTone, HomeTwoTone, MobileOutlined, ShopTwoTone } from '@ant-design/icons';
import banner1 from '../../images/banner1.jpg';
import banner2 from '../../images/banner2.jpg';
import banner3 from '../../images/banner3.jpg';
import vnTC from '../../images/vnTC.png';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { createRecycleRequest } from '../../services/recycleService';
import { Upload } from 'antd'; // Thêm import này
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { getToken } from '../../services/localStorageService';
import { BASE_URL } from "../../config";
const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

function GreenPhone() {
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [deviceType, setDeviceType] = React.useState('');
    const [deviceCondition, setDeviceCondition] = React.useState('');
    const [pickupMethod, setPickupMethod] = React.useState('');
    const [currentStep, setCurrentStep] = React.useState(0);
    const [form] = Form.useForm();
    const [requestId, setRequestId] = React.useState(null); // Thêm state để lưu trữ ID request
    const navigate = useNavigate(); // Khởi tạo useNavigate
    //upload image 
    const [imageUrl, setImageUrl] = useState(null); // Thêm state này
    const [loadingUpload, setLoadingUpload] = useState(false); // Thêm state này
    const sliderImages = [
        banner1,
        banner2,
        banner3,
        // Thêm các URL ảnh khác vào đây
    ];
    const steps = [
        {
            title: 'Kiểm tra & Phân loại',
            content: 'Đánh giá tình trạng điện thoại: còn hoạt động, cần sửa chữa hay hỏng hoàn toàn.',
        },
        {
            title: 'Xử lý theo từng loại',
            content: (
                <>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }}>Điện thoại còn dùng tốt → Tân trang và bán lại.</Paragraph>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }} >Điện thoại hỏng nhưng sửa được → Sửa chữa, thay linh kiện.</Paragraph>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }} >Điện thoại hỏng hoàn toàn → Tháo linh kiện hữu ích, phần còn lại gửi đi tái chế.</Paragraph>
                </>
            ),
        },
        {
            title: 'Bán lại & Tái chế',
            content: (
                <>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }}>Các thiết bị sửa xong sẽ được bảo hành và bán lại.</Paragraph>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }}>Linh kiện hỏng sẽ được chuyển đến đơn vị tái chế chuyên nghiệp.</Paragraph>
                </>
            ),
        },
    ];

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };
    const isLoggedIn = () => {
        const token = getToken();
        if (token) {
            return true;
        }
        return false;
    };
    const showModal = () => {
        if (isLoggedIn()) {
            setIsModalVisible(true);
        } else {
            message.warning('Vui lòng đăng nhập để đăng ký thu gom hoặc điền từ Google Form!');

        }
    };
    const openGoogleForm = () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSdEy7vCDxkrGWtBClp9qRVv54gyPSib_sVTUBiyAeYPsXWnqg/viewform', '_blank'); // Thay thế YOUR_GOOGLE_FORM_URL bằng URL form Google của bạn
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const handleModalSubmit = async () => {
        console.log('Modal values:', { deviceType, deviceCondition, pickupMethod });
        const requestData = {
            deviceType: deviceType,
            deviceCondition: deviceCondition,
            pickupMethod: pickupMethod,
            imageUrl: imageUrl,
        };
        console.log("Request data:", requestData);
        try {
            const result = await createRecycleRequest(requestData);
            if (result) {
                message.success('Yêu cầu thu gom đã được gửi! Hãy theo dõi tiến trình để nhận biết kết quả');
                setIsModalVisible(false);
                setRequestId(result.result.id); // Lưu ID request để điều hướng
            }
        }
        catch (error) {
            message.error('Có lỗi xảy ra khi gửi yêu cầu!');
        }
        form.resetFields();
    };
    const uploadButton = (
        <div>
            {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );
    const handleViewProgress = () => {
        console.log('View progress:', requestId);
        navigate(`/profile`); // Điều hướng đến trang tiến trình
    };
    // Hàm xử lý upload ảnh
    const handleUploadChange = (info) => {
        console.log('Upload response:', info.file.response);

        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
            return;
        }
        if (info.file.status === 'done') {

            // Lấy URL ảnh từ response
            setImageUrl(info.file.response.url);
            setLoadingUpload(false);
        }
    };
    // Hàm custom request để upload ảnh
    const customUploadRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${BASE_URL}/api/upload`, { // Thay đổi URL upload nếu cần
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess(data);
            } else {
                onError();
            }
        } catch (error) {
            onError();
        }
    };
    const imageUrls = `${imageUrl}`;
    return (
        <div style={{ padding: '20px' }}>
            <div className='slider'>
                <Carousel autoplay>
                    {sliderImages.map((img, index) => (
                        <div key={index}>
                            <img src={img} alt={`Slider ${index + 1}`} style={{ width: '100%' }} />
                        </div>
                    ))}
                </Carousel>
            </div>
            <Title level={1} style={{ textAlign: 'center' }}> 🌿 Chương Trình "Điện Thoại Xanh"</Title>

            <div className="recycle-image2">
                <div className='recycle-image2_1'  >
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }}>
                        Trong thời đại công nghệ phát triển nhanh chóng, rác thải điện tử đang trở thành một vấn đề lớn đối với môi trường.
                        Mỗi năm, hàng triệu chiếc điện thoại cũ bị vứt bỏ, tạo ra lượng rác thải độc hại khổng lồ.

                        Vậy giải pháp là gì?
                    </Paragraph>
                    <Paragraph style={{ fontSize: '18px', textAlign: 'justify' }}>
                        Chương trình <b style={{ color: 'Green' }}>"Điện Thoại Xanh"</b> ra đời nhằm thu gom, sửa chữa và tái chế điện thoại cũ,
                        góp phần bảo vệ môi trường và tối ưu hóa tài nguyên.
                        <br />Thay vì vứt bỏ điện thoại hỏng, bạn có thể gửi đến chúng tôi để được tái chế an toàn,
                        tân trang hoặc tận dụng linh kiện một cách hiệu quả.
                    </Paragraph>
                </div>
                <div className='recycle-image2_2'>
                    <img src={vntaiche} alt="Tái chế điện thoại" className="recycle-image2" />
                </div>
            </div>
            <Title level={3}> Tại sao nên tham gia <b style={{ color: 'Green' }}>"Điện Thoại Xanh"</b> ?</Title>
            <div className="dashed-border-box">
                <List
                    bordered
                    dataSource={[
                        'Bảo vệ môi trường – Giảm thiểu rác thải điện tử, hạn chế ô nhiễm.',
                        'Tận dụng tài nguyên – Linh kiện cũ được tái sử dụng thay vì khai thác nguyên liệu mới.',
                        'Tiết kiệm & tiện lợi – Hỗ trợ thu gom miễn phí, quy trình đơn giản.',
                        'Ưu đãi hấp dẫn – Giảm giá khi mua điện thoại mới, tích điểm đổi quà.',
                    ]}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                />
            </div>
            <Divider />

            <Title level={3}>1️⃣ Giới thiệu về tái chế điện thoại</Title>
            <Collapse>
                <Panel header="Tại sao nên tái chế?" key="1">
                    <Paragraph style={{ fontSize: '18px' }} >Giảm ô nhiễm môi trường, hạn chế rác thải điện tử.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }} >Tận dụng tài nguyên từ thiết bị cũ, giảm khai thác nguyên liệu mới.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }} >Đóng góp vào nền kinh tế tuần hoàn.</Paragraph>
                </Panel>
                <Panel header="Lợi ích môi trường & kinh tế" key="2">
                    <Paragraph style={{ fontSize: '18px' }} >Giảm khí thải độc hại từ rác điện tử.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }} >Tiết kiệm chi phí sản xuất nhờ tái sử dụng linh kiện.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }} >Khuyến khích khách hàng tham gia bảo vệ môi trường.</Paragraph>
                </Panel>
            </Collapse>

            <Divider />

            <Title level={3}>2️⃣ Quy trình xử lý rác điện tử tại cửa hàng</Title>
            <Steps current={currentStep}>
                {steps.map((item) => (
                    <Step key={item.title} title={item.title} />
                ))}

            </Steps>

            <div style={{ marginTop: '20px' }}>
                <div className="step-content">
                    <Card>{steps[currentStep].content}</Card>
                    <div className="step-buttons-container"> {/* Thêm div bọc nút và class */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {currentStep > 0 && (
                                <Button style={{ marginRight: '10px' }} onClick={prevStep}>
                                    Quay lại
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={nextStep} style={{ backgroundColor: '#8CC63E' }}>
                                    Tiếp theo
                                </Button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <Divider />
            <Title level={3}>3️⃣ Cách thu gom điện thoại cũ/hỏng</Title>
            <div className='thugom'>

                <div className='thugomLeft' >
                    <div>Đăng ký request tái chế:</div>
                    <p>
                        Cách 1: Sử dụng chức năng "Đăng ký thu gom" tại mục 6
                        <div style={{ color: 'red', fontSize: '0.6em' }}>Chú ý: Có thể xem tiến trình diễn ra sau khi đăng ký</div>
                    </p>

                    <p>
                        Cách 2: Điền form Google
                        <div style={{ color: 'red', fontSize: '0.6em' }}>Chú ý: Không thể xem tiến trình diễn ra (dành cho khách hàng không muốn đăng nhập)
                        </div>
                    </p>
                    <div>Lựa chọn 1 trong 3 phương thức</div>
                    <p>Phương thức 1: Gửi qua bưu điện <DatabaseTwoTone />– Khách tự gửi điện thoại đến cửa hàng.</p>
                    <p>Phương thức 2: Thu gom tận nhà <HomeTwoTone /> – Cửa hàng đến lấy nếu số lượng lớn.</p>
                    <p>Phương thức 3: Nộp tại cửa hàng <ShopTwoTone />– Khách đến trực tiếp để kiểm tra và định giá.</p>
                </div>
                <div className='thugomRight'>
                    <img src={thugom} alt="Tái chế điện thoại" className="recycle-image" />
                </div>
            </div>
            <Divider />

            <Title level={3}>4️⃣ Chính sách thu mua & định giá</Title>
            <Collapse>
                <Panel header="Nguyên tắc thu mua" key="3">
                    <Paragraph style={{ fontSize: '18px' }} >Điện thoại còn dùng được → Giá cao hơn, có thể bán lại.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Điện thoại hỏng nhưng có thể sửa → Giá thấp hơn.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Điện thoại hỏng hoàn toàn → Mua giá rẻ hoặc thu miễn phí để lấy linh kiện.</Paragraph>
                </Panel>
                <Panel header="Ưu đãi cho khách hàng" key="4">
                    <Paragraph style={{ fontSize: '18px' }}>Hỗ trợ giảm giá khi mua điện thoại mới nếu đổi điện thoại cũ.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Chính sách hoàn tiền nếu điện thoại thu mua không sửa được.</Paragraph>
                </Panel>
            </Collapse>

            <Divider />



            <Divider />

            <Title level={3}>5️⃣  Hợp Tác với <b style={{ color: 'green' }}>"Việt Nam Tái Chế"</b></Title>
            <Collapse>
                <Panel header="Giới thiệu về chương trình 'Việt Nam Tái Chế'" key="5">
                    <div className="recycle-image2">
                        <div className='recycle-image2_1'  >
                            <Paragraph style={{ fontSize: '18px' }}>"Việt Nam Tái Chế" là chương trình thu gom & xử lý rác thải điện tử miễn phí theo tiêu chuẩn quốc tế.</Paragraph>
                            <Paragraph style={{ fontSize: '18px' }}>Họ hợp tác với nhiều thương hiệu lớn như Apple, Dell, HP, Panasonic… để thu gom & xử lý an toàn.</Paragraph>
                            <Paragraph style={{ fontSize: '18px' }}>Đảm bảo các thiết bị được tái chế đúng cách, không gây hại cho môi trường.</Paragraph></div>
                        <div className='recycle-image2_2'>
                            <img src={vnTC} alt="Tái chế điện thoại" className="recycle-image2" />
                        </div>
                    </div>


                </Panel>
                <Panel header="Vai trò của cửa hàng trong chương trình này" key="6">
                    <Paragraph style={{ fontSize: '18px' }}>Cửa hàng đóng vai trò là điểm trung gian thu gom các thiết bị hỏng và gửi đến "Việt Nam Tái Chế".</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Với những thiết bị không thể sửa chữa hoặc bán lại, cửa hàng hỗ trợ khách hàng gửi đến chương trình.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Cung cấp chứng nhận tái chế cho khách hàng sau khi sản phẩm được xử lý.</Paragraph>
                </Panel>
                <Panel header="Quy trình hợp tác" key="7">
                    <Paragraph style={{ fontSize: '18px' }}>Bước 1: Khi khách hàng gửi thiết bị, cửa hàng phân loại thành:</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>✔️ Có thể sửa chữa (tân trang & bán lại).</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>✔️ Không thể sửa (Gửi đến "Việt Nam Tái Chế" xử lý).</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Bước 2: Nếu khách hàng muốn gửi thiết bị trực tiếp đến "Việt Nam Tái Chế", cửa hàng cung cấp thông tin & hướng dẫn.</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Bước 3: Cửa hàng định kỳ gửi các thiết bị thu gom được đến "Việt Nam Tái Chế".</Paragraph>
                    <Paragraph style={{ fontSize: '18px' }}>Bước 4: Khách hàng có thể tra cứu tình trạng tái chế trên hệ thống của cửa hàng hoặc website "Việt Nam Tái Chế".</Paragraph>
                </Panel>
            </Collapse>

            <Divider />
            <Title level={3}> 6️⃣ Form đăng ký thu gom thiết bị điện tử</Title>

            <Button type="primary" htmlType="button" onClick={showModal} style={{ marginLeft: '40px', backgroundColor: '#8CC63E' }}>
                Đăng ký thu gom
            </Button>
            {
                requestId && ( // Hiển thị nút "Xem tiến trình" khi requestId có giá trị
                    <Button
                        type="primary"
                        onClick={handleViewProgress}
                        style={{ marginLeft: '10px' }}
                    >
                        Xem tiến trình
                    </Button>
                )
            }
            <Button type="link" onClick={openGoogleForm} style={{ marginLeft: '10px' }}>
                Điền form Google
            </Button>
            <Modal
                title={
                    <Space>
                        <MobileOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>Đăng ký thu gom điện thoại</Title>
                    </Space>
                }
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={450}
                bodyStyle={{ padding: '20px' }}
                centered
            >
                <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                    Vui lòng điền thông tin để đăng ký thu gom thiết bị điện thoại cũ của bạn.
                </Text>

                <Form layout="vertical" onFinish={handleModalSubmit}>
                    <Form.Item
                        label={<Text strong>Loại thiết bị</Text>}
                        style={{ marginBottom: '16px' }}
                    >
                        <Input
                            value={deviceType}
                            onChange={(e) => setDeviceType(e.target.value)}
                            placeholder="Nhập loại thiết bị của bạn"
                            style={{ borderRadius: '6px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Tình trạng thiết bị</Text>}
                        style={{ marginBottom: '16px' }}
                    >
                        <Input
                            value={deviceCondition}
                            onChange={(e) => setDeviceCondition(e.target.value)}
                            placeholder="Mô tả tình trạng thiết bị"
                            style={{ borderRadius: '6px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Phương thức nhận</Text>}
                        style={{ marginBottom: '24px' }}
                    >
                        <Select
                            value={pickupMethod}
                            onChange={(value) => setPickupMethod(value)}
                            style={{ width: '100%', borderRadius: '6px' }}
                        >
                            <Select.Option value="Cửa hàng">Cửa hàng</Select.Option>
                            <Select.Option value="Tại nhà">Tại nhà</Select.Option>
                            <Select.Option value="Bưu điện">Bưu điện</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button
                                onClick={handleCancel}
                                style={{ borderRadius: '6px' }}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<CheckCircleOutlined />}
                                style={{
                                    borderRadius: '6px',
                                    background: '#1890ff',
                                    boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
                                }}
                            >
                                Gửi yêu cầu
                            </Button>

                        </Space>
                    </Form.Item>
                    <Form.Item label={<Text strong>Hình ảnh</Text>}>
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            customRequest={customUploadRequest}
                            onChange={handleUploadChange}
                        >
                            {imageUrls ? <img
                                src={imageUrls}
                                alt="avatar"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            /> : uploadButton}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
            <Title level={3}>7️⃣ Ưu Đãi Cho Khách Hàng Khi Tham Gia Tái Chế</Title>
            <Paragraph style={{ fontSize: '18px' }}>Chương trình ưu đãi đặc biệt:</Paragraph>
            <List
                bordered
                dataSource={[
                    'Giảm giá khi mua điện thoại mới: Nếu khách hàng gửi điện thoại cũ để tái chế, họ nhận được voucher giảm giá 15% khi mua sản phẩm tại cửa hàng.',
                    'Điểm thưởng thành viên: Mỗi lần gửi thiết bị tái chế, khách hàng được tích điểm đổi quà.',
                    'Chứng nhận tái chế: Sau khi thiết bị được tái chế thành công, khách hàng nhận email xác nhận.',
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />
            <Paragraph style={{ fontSize: '18px' }}> Mục tiêu của chương trình này:</Paragraph>
            <List
                bordered
                dataSource={[
                    'Khuyến khích người dùng tái chế thay vì vứt bỏ.',
                    'Xây dựng hình ảnh cửa hàng là một doanh nghiệp có trách nhiệm với môi trường.',
                    'Tận dụng các thiết bị còn giá trị để sửa chữa, bán lại.',
                ]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />

            <Divider />

            <Title level={3}>9️⃣ Câu hỏi thường gặp (FAQ)</Title>
            <Collapse>
                <Panel header="Câu hỏi phổ biến" key="8">
                    <List
                        bordered
                        dataSource={[
                            'Mất bao lâu để xử lý một đơn thu gom?',
                            'Tôi có thể đổi điện thoại cũ lấy điện thoại mới không?',
                            'Nếu tôi gửi điện thoại nhưng không đồng ý giá thu mua thì sao?',
                            'Những loại điện thoại nào không được nhận thu gom?',
                        ]}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                    />
                </Panel>
            </Collapse>
        </div >
    );
}

export default GreenPhone;