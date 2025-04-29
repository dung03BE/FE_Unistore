import React from 'react';
import { Collapse } from 'antd';

const { Panel } = Collapse;

function ProductSpecs({ details }) {
    if (!details) return null;

    const specs = {
        "Cấu hình & Bộ nhớ": {
            "Kích thước màn hình": details.screen_size,
            "Độ phân giải": details.resolution,
            "Bộ xử lý": details.processor,
            "RAM": details.ram,
            "Bộ nhớ trong": details.storage,
            "Dung lượng pin": details.battery,
            "Hệ điều hành": details.os,
        },
        "Camera": {
            "Camera chính": details.camera,
        },
        "Thông tin khác": {
            "Khối lượng": details.weight,
            "Kích thước": details.dimensions,
            "SIM": details.sim,
            "Mạng": details.network,
        },
    };

    return (
        <Collapse accordion>
            {Object.keys(specs).map((key) => (
                <Panel header={key} key={key}>
                    {Object.entries(specs[key]).map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{label}:</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </Panel>
            ))}
        </Collapse>
    );
}

export default ProductSpecs;