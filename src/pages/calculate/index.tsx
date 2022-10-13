import classNames from 'classnames/bind';
import styles from './Calculate.module.scss';
import { useEffect, useState } from 'react';
import {
    Button,
    Col,
    PageHeader,
    Row,
    Form,
    DatePicker,
    Select,
    message,
    DatePickerProps,
    Space,
} from 'antd';
import {
    SearchOutlined,
    CalculatorOutlined,
    EyeOutlined,
    DollarCircleOutlined,
    PrinterOutlined,
} from '@ant-design/icons';
import { getRooms, getStatisticalRoomStatus, getRoom } from '~/api/room.api';
import { MotelType } from '~/types/MotelType';
import { getAllMotel } from '~/api/motel.api';
import moment from 'moment';
import {
    CalculatorMoney,
    listCalculator,
    listCalculatorByMonth,
} from '~/api/calculator.api';
import Table from '~/components/table';
import Modal from '~/components/modal';
import { RoomType } from '~/types/RoomType';

import { getDataWaterByMotelRoomId } from '~/api/data-water.api';
import { getDataPowerByMotelRoomId } from '~/api/data-power.api';
import { DATE_FORMAT } from '~/consts/const';
import { generatePriceToVND } from '~/utils/helper';

const cx = classNames.bind(styles);
const { Option } = Select;
type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const Calculate = () => {
    const [form] = Form.useForm();

    const [listNameMotel, setListNameMotel] = useState<MotelType[]>([]);
    const [listNameRoom, setListNameRoom] = useState<RoomType[]>([]);
    const [listStatusRoom, setListStatusRoom] = useState([]);
    const [calculator, setCalculator] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalReceipt, setIsModalReceipt] = useState(false);
    const [room, setRoom] = useState<RoomType>();

    const ColumnsData: ColumnTypes[number][] = [
        {
            title: '',
            dataIndex: '_id',
            key: '_id',
            render: () => {
                return (
                    <Space>
                        <Button
                            htmlType='submit'
                            type='primary'
                            icon={<EyeOutlined />}
                            onClick={() => setIsModalReceipt(!isModalReceipt)}
                            title='Xem hóa đơn'
                        ></Button>
                        <Button
                            htmlType='submit'
                            type='primary'
                            icon={<DollarCircleOutlined />}
                            onClick={() => setIsModalReceipt(!isModalReceipt)}
                            title='Nhập số tiền đã thu'
                        />
                        <Button
                            htmlType='submit'
                            type='primary'
                            icon={<PrinterOutlined />}
                            onClick={() => setIsModalReceipt(!isModalReceipt)}
                            title='In hóa đơn'
                        />
                    </Space>
                );
            },
        },
        {
            title: 'Nhà',
            dataIndex: ['motelID', 'name'],
            key: 'name',
        },
        {
            title: 'Phòng',
            dataIndex: ['roomRentalDetailID', 'roomName'],
            key: 'roomName',
        },
        {
            title: 'Khách thuê',
            dataIndex: ['roomRentalDetailID', 'customerName'],
            key: 'customerName',
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (totalAmount: number) => {
                return <>{generatePriceToVND(+totalAmount)}</>;
            },
        },
        {
            title: 'Đã trả',
            dataIndex: 'payAmount',
            key: 'payAmount',
            render: (payAmount: number) => {
                return <>{generatePriceToVND(+payAmount)}</>;
            },
        },
        {
            title: 'Còn lại',
            dataIndex: 'remainAmount',
            key: 'remainAmount',
            render: (remainAmount: number) => {
                return <>{generatePriceToVND(+remainAmount)}</>;
            },
        },
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };
    const onClickMotel = async (value: string) => {
        const { data } = await getRooms(value);
        setListNameRoom(data);
    };
    const onClickRoom = async (value: string) => {
        const { data } = await getRoom(value);
        setRoom(data);
    };
    const onCalculator = async (values: any) => {
        if (room?._id && room?.roomRentID) {
            const dataPower = await getDataPowerByMotelRoomId(room?._id);
            const dataWater = await getDataWaterByMotelRoomId(room?._id);

            values = {
                data: [
                    {
                        ...values,
                        motelID: room.motelID,
                        dataPowerID: dataPower.data._id,
                        dataWaterID: dataWater.data._id,
                        roomRentalDetailID: room.roomRentID,
                        invoiceDate: moment(values.invoiceDate).format(
                            DATE_FORMAT
                        ),
                        month: moment(values.month).format('MM'),
                        year: moment(values.month).format('YYYY'),
                    },
                ],
            };

            await CalculatorMoney(values);
            const { data } = await listCalculator();
            setCalculator(data);
        } else {
            alert('Mời bạn chọn lại!');
        }

        form.resetFields();
        setIsModalOpen(false);
    };

    const handleChangeMonth: DatePickerProps['onChange'] = (
        date,
        dateString
    ) => {
        const month = moment(date).format('MM');

        const calculatorData = async () => {
            const { data } = await listCalculatorByMonth({
                month,
            });
            setCalculator(data);
        };
        calculatorData();
    };

    useEffect(() => {
        const handleFetchData = async () => {
            try {
                const [motelRoom, calculatorData, statisticalRoomStatus] =
                    await Promise.all([
                        getAllMotel(),
                        listCalculator(),
                        getStatisticalRoomStatus(),
                    ]);
                setListNameMotel(motelRoom.data);
                setCalculator(calculatorData.data);
                setListStatusRoom(statisticalRoomStatus.data);
            } catch (error) {
                // message.error(error);
            }
        };
        handleFetchData();
    }, []);

    return (
        <div>
            <div>
                <PageHeader
                    className={cx('header-top')}
                    title='Tính Tiền'
                    extra={[
                        <Button icon={<SearchOutlined />} key={1}>
                            Xem
                        </Button>,
                        <Button
                            type='primary'
                            icon={<CalculatorOutlined />}
                            key={2}
                            onClick={showModal}
                        >
                            Tính Tiền
                        </Button>,
                    ]}
                >
                    <Modal
                        title='Thông báo'
                        open={isModalOpen}
                        onOk={form.submit}
                        onCancel={handleCancel}
                    >
                        <>
                            <Form
                                autoComplete='off'
                                form={form}
                                labelCol={{ span: 5 }}
                                onFinish={onCalculator}
                            >
                                <Form.Item
                                    label={<>Kỳ</>}
                                    colon={false}
                                    labelAlign='left'
                                    name='paymentPeriod'
                                >
                                    <Select
                                        style={{ width: 375 }}
                                        placeholder='Tất cả'
                                        showSearch
                                    >
                                        <Option value={2}>Kỳ 30</Option>
                                        <Option value={3}>Kỳ 15</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label={<>Ngày</>}
                                    colon={false}
                                    labelAlign='left'
                                    name='invoiceDate'
                                    initialValue={moment()}
                                >
                                    <DatePicker
                                        format={'DD/MM/YYYY'}
                                        style={{ width: '375px' }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    labelAlign='left'
                                    label={<>Tháng/năm</>}
                                    colon={false}
                                >
                                    <DatePicker
                                        defaultValue={moment()}
                                        clearIcon={null}
                                        format={'MM/YYYY'}
                                        name='month'
                                        picker='month'
                                        onChange={handleChangeMonth}
                                        style={{ width: '375px' }}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={<>Nhà</>}
                                    colon={false}
                                    labelAlign='left'
                                    name='motelID'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn!',
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder='Mời bạn chọn nhà'
                                        showSearch
                                        onChange={onClickMotel}
                                    >
                                        {listNameMotel &&
                                            listNameMotel.map((item, index) => {
                                                return (
                                                    <Option
                                                        key={index}
                                                        value={item._id}
                                                    >
                                                        {item.name}
                                                    </Option>
                                                );
                                            })}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label={<>Phòng</>}
                                    colon={false}
                                    labelAlign='left'
                                    name='roomID'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn!',
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder='Mời bạn chọn phòng'
                                        showSearch
                                        onChange={onClickRoom}
                                    >
                                        {listNameRoom &&
                                            listNameRoom.map((item, index) => {
                                                return (
                                                    <Option
                                                        key={index}
                                                        value={item._id}
                                                    >
                                                        {item.roomName}
                                                    </Option>
                                                );
                                            })}
                                    </Select>
                                </Form.Item>
                            </Form>
                            <p>Bạn có muốn tính tiền tháng này không?</p>
                        </>
                    </Modal>
                </PageHeader>
            </div>

            <div className={cx('header-bottom')}>
                <Row gutter={[8, 8]}>
                    <Col span={6}>
                        <Form.Item label={<>Tháng/năm</>} colon={false}>
                            <DatePicker
                                defaultValue={moment()}
                                clearIcon={null}
                                format={'MM/YYYY'}
                                name='date'
                                picker='month'
                                onChange={handleChangeMonth}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={<>Kỳ</>} colon={false}>
                            <Select
                                style={{ width: 150 }}
                                defaultValue='Tất cả'
                                showSearch
                            >
                                <Option value={2}>Kỳ 30</Option>
                                <Option value={3}>Kỳ 15</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={<>Nhà</>} colon={false}>
                            <Select
                                style={{ width: 150 }}
                                defaultValue='Tất cả'
                                showSearch
                            >
                                {listNameMotel &&
                                    listNameMotel.map((item, index) => {
                                        return (
                                            <Option
                                                key={index}
                                                value={item._id}
                                            >
                                                {item.name}
                                            </Option>
                                        );
                                    })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={<>Trạng thái nhà</>} colon={false}>
                            <Select
                                style={{ width: 150 }}
                                defaultValue='Tất cả'
                                showSearch
                            >
                                {listStatusRoom &&
                                    listStatusRoom.map((item: any, index) => {
                                        return (
                                            <Option key={index}>
                                                {item.statusName}
                                            </Option>
                                        );
                                    })}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            <div>
                <Table columns={ColumnsData} dataSource={calculator} />
                <Modal
                    open={isModalReceipt}
                    title='Hóa đơn'
                    onOk={() => setIsModalReceipt(false)}
                    onCancel={() => setIsModalReceipt(false)}
                    footer={[
                        <Button type='primary' key='button_1'>
                            Tải file PDF
                        </Button>,
                        <Button type='ghost' key='button_1'>
                            Gửi mail
                        </Button>,
                        <Button
                            type='primary'
                            key='button_2'
                            onClick={() => setIsModalReceipt(false)}
                            danger
                        >
                            Đóng
                        </Button>,
                    ]}
                >
                    <h1>Hóa đơn</h1>
                </Modal>
            </div>
        </div>
    );
};

export default Calculate;
