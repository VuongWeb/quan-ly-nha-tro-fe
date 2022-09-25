import { Card, Button, Row, Col } from 'antd';
import {
    EditOutlined,
    PlusSquareOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import styles from './Card.module.scss';
import classNames from 'classnames/bind';
import { generatePriceToVND } from '~/utils/helper';

export interface Props {
    roomName?: ReactNode | string;
    unitPrice: number;
    maxPerson?: number;
    isRent: boolean;
    customerName: string;
    idRoom?: string;
    onRemoveMotel: () => void;
}
const cx = classNames.bind(styles);
const CardItem = ({
    unitPrice,
    maxPerson,
    roomName,
    idRoom,
    isRent,
    customerName,
    onRemoveMotel,
}: Props) => {
    return (
        <Card
            className={cx(`card-item`)}
            title={roomName}
            hoverable
            style={isRent ? { background: '#ffc53d' } : {}}
        >
            <Col>
                {isRent ? (
                    <div className={cx('d-flex -justify-space-between')}>
                        <h3>Trả</h3>
                        <h3>Đổi</h3>
                        <h3>Xem</h3>
                        <h3>Sửa</h3>
                    </div>
                ) : (
                    <Button type='primary' icon={<PlusSquareOutlined />}>
                        <Link
                            to={`/customer/create?roomId=${idRoom}`}
                            style={{ color: 'white' }}
                        >
                            Thêm khách
                        </Link>
                    </Button>
                )}
            </Col>
            <p>Khách thuê phòng: {customerName}</p>
            <p>Số lượng khách: {maxPerson}</p>
            <p>Giá phòng: {generatePriceToVND(unitPrice)}</p>
            <Row>
                <Col span={12}>
                    <Button type='primary' icon={<EditOutlined />}>
                        <Link
                            to={`/motel-room/edit-room/${idRoom}`}
                            style={{ color: 'white' }}
                        >
                            Sửa
                        </Link>
                    </Button>
                </Col>
                <Col span={12}>
                    <Button
                        type='primary'
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => onRemoveMotel()}
                    >
                        Xóa
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default CardItem;