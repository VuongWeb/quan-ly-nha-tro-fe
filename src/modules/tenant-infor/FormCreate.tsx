/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Upload,
    UploadProps,
} from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload';
import classNames from 'classnames/bind';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { listSearchRoomDeposit } from '~/api/booking.api';
import { getDetailCustomerToRoom } from '~/api/customer.api';
import { getRoom } from '~/api/room.api';
import { useAppDispatch } from '~/app/hooks';
import { DateFormat } from '~/constants/const';
import { setIsLoading } from '~/feature/service/appSlice';
import { convertDate } from '~/utils/helper';
import styles from './FormCreate.module.scss';

const cx = classNames.bind(styles);

const { Option } = Select;
const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
};
type Props = {
    onSave: (values: any) => void;
    roomRentID: string;
    form: any;
    roomName: string;
    roomId: string;
    provinces: any;
    setImg: React.Dispatch<any>;
    images: any;
    imageUrl: any;
    setImageUrl: any;
};

const FormCreate = ({
    onSave,
    roomRentID,
    roomName,
    form,
    provinces,
    roomId,
    setImg,
    images: fileList,
    imageUrl,
    setImageUrl,
}: Props) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [roomDeposit, setRoomDeposit] = useState<any>([]);

    const handleChange: UploadProps['onChange'] = (
        info: UploadChangeParam<UploadFile>
    ) => {
        getBase64(info.file.originFileObj as RcFile, (url) => {
            setLoading(false);
            setImageUrl(url);
        });

        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as RcFile, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    useEffect(() => {
        if (roomId) {
            const readRoom = async () => {
                const { data } = await getRoom(roomId);

                form.setFieldsValue({
                    priceRoom: data.unitPrice,
                });
            };
            readRoom();
        }
        if (roomRentID) {
            const dataRoom = async () => {
                const { data } = await getDetailCustomerToRoom(roomRentID);

                form.setFieldsValue({
                    ...data,
                    dateOfBirth: data.dateOfBirth
                        ? moment(data.dateOfBirth, DateFormat.DATE_DEFAULT)
                        : '',
                    startDate: data.startDate
                        ? moment(data.startDate, DateFormat.DATE_DEFAULT)
                        : moment(new Date(), DateFormat.DATE_DEFAULT),
                });
            };
            dataRoom();
        }
    }, []);

    useEffect(() => {
        const handleFetchData = async () => {
            try {
                dispatch(setIsLoading(true));
                const result = {
                    data: {
                        fromDate: convertDate(
                            moment(new Date()).startOf('month'),
                            DateFormat.DATE_M_D_Y
                        ),
                        toDate: convertDate(
                            moment(new Date()).endOf('month'),
                            DateFormat.DATE_M_D_Y
                        ),
                    },
                };

                const { data } = await listSearchRoomDeposit(result);
                setRoomDeposit(data);
                dispatch(setIsLoading(false));
            } catch (error) {
                // message.error(error);
            }
        };
        handleFetchData();
    }, []);

    const handleCheckRoomDeposit = (roomId: string) => {
        let result = {};
        if (roomDeposit.length > 0) {
            result = roomDeposit.find((item: any) => {
                return item.motelRoomId?._id === roomId && item;
            });
        }

        return result ?? {};
    };

    const roomDeposits: any = handleCheckRoomDeposit(roomId);

    return (
        <Form
            className={cx('form-create')}
            autoComplete='off'
            form={form}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 16 }}
            style={{ marginTop: 20, padding: 20 }}
            onFinish={onSave}
        >
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Họ và tên</>}
                        colon={false}
                        labelAlign='left'
                        name='customerName'
                        rules={[
                            {
                                required: true,
                                message:
                                    'Vui lòng nhập tên người dùng của bạn!',
                            },
                        ]}
                        validateTrigger={['onChange']}
                    >
                        <Input
                            defaultValue={roomDeposits?.fullName}
                            style={{ width: 400 }}
                            autoFocus
                        />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>CMND/ CCCD</>}
                        colon={false}
                        labelAlign='left'
                        name='citizenIdentification'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input style={{ width: 400 }} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Giới Tính</>}
                        colon={false}
                        labelAlign='left'
                        name='gender'
                    >
                        <Select
                            placeholder='Mời chọn giới tính'
                            showSearch
                            style={{ width: 400 }}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                (
                                    option!.children as unknown as string
                                ).includes(input)
                            }
                        >
                            <Option value={1}>Nam</Option>
                            <Option value={2}>Nữ</Option>
                            <Option value={3}>Khác</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Ngày cấp</>}
                        colon={false}
                        labelAlign='left'
                        name='dateRange'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                    >
                        <DatePicker
                            format={DateFormat.DATE_DEFAULT}
                            style={{ width: 400 }}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Số điện thoại</>}
                        colon={false}
                        labelAlign='left'
                        name='phone'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input style={{ width: 400 }} />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Nơi cấp</>}
                        colon={false}
                        labelAlign='left'
                        name='issuedBy'
                    >
                        <Select
                            placeholder='Mời chọn nơi cấp'
                            showSearch
                            style={{ width: 400 }}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                (
                                    option!.children as unknown as string
                                ).includes(input)
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA!.children as unknown as string)
                                    .toLowerCase()
                                    .localeCompare(
                                        (
                                            optionB!
                                                .children as unknown as string
                                        ).toLowerCase()
                                    )
                            }
                        >
                            {provinces.map((item: any, index: any) => {
                                return (
                                    <Option key={index} value={item?.name}>
                                        {item?.name}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Địa chỉ thường trú</>}
                        colon={false}
                        labelAlign='left'
                        name='address'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input style={{ width: 400 }} />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Email</>}
                        colon={false}
                        labelAlign='left'
                        name='email'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <Input style={{ width: 400 }} />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Ngày sinh</>}
                        colon={false}
                        labelAlign='left'
                        name='dateOfBirth'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập!',
                            },
                        ]}
                        validateTrigger={['onBlur', 'onChange']}
                    >
                        <DatePicker
                            format={DateFormat.DATE_DEFAULT}
                            style={{ width: 400 }}
                        />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Nơi sinh</>}
                        colon={false}
                        labelAlign='left'
                        name='birthPlace'
                    >
                        <Select
                            placeholder='Mời chọn nơi sinh'
                            showSearch
                            style={{ width: 400 }}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                (
                                    option!.children as unknown as string
                                ).includes(input)
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA!.children as unknown as string)
                                    .toLowerCase()
                                    .localeCompare(
                                        (
                                            optionB!
                                                .children as unknown as string
                                        ).toLowerCase()
                                    )
                            }
                        >
                            {provinces.map((item: any, index: any) => {
                                return (
                                    <Option key={index} value={item?.name}>
                                        {item?.name}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Thuê phòng số </>}
                        colon={false}
                        name='roomName'
                        initialValue={roomName}
                        labelAlign='left'
                    >
                        <Input disabled style={{ width: 400 }} />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Tiền phòng</>}
                        name='priceRoom'
                        colon={false}
                        labelAlign='left'
                    >
                        <InputNumber
                            formatter={(value) =>
                                ` ${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ','
                                )
                            }
                            parser={(value: any) =>
                                value.replace(/\$\s?|(,*)/g, '')
                            }
                            addonAfter={'VND'}
                            style={{ width: 400 }}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Ngày bắt đầu </>}
                        colon={false}
                        labelAlign='left'
                        name={'startDate'}
                        initialValue={moment()}
                    >
                        <DatePicker
                            format={DateFormat.DATE_DEFAULT}
                            style={{ width: 400 }}
                        />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Đặt cọc</>}
                        colon={false}
                        name={
                            Object.keys(roomDeposit).length <= 0
                                ? 'deposit'
                                : 'bookingAmount'
                        }
                        labelAlign='left'
                    >
                        <InputNumber
                            value={roomDeposits?.bookingAmount}
                            formatter={(value) =>
                                ` ${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ','
                                )
                            }
                            parser={(value: any) =>
                                value.replace(/\$\s?|(,*)/g, '')
                            }
                            addonAfter='VNĐ'
                            style={{ width: 400 }}
                        />{' '}
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Kỳ thanh toán</>}
                        colon={false}
                        labelAlign='left'
                        name='paymentPeriod'
                    >
                        <Select
                            placeholder='Mời chọn kỳ thanh toán'
                            showSearch
                            style={{ width: 400 }}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                (
                                    option!.children as unknown as string
                                ).includes(input)
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA!.children as unknown as string)
                                    .toLowerCase()
                                    .localeCompare(
                                        (
                                            optionB!
                                                .children as unknown as string
                                        ).toLowerCase()
                                    )
                            }
                        >
                            <Option value={1}>Kỳ 30</Option>
                            <Option value={2}>Kỳ 15</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Thanh toán mỗi lần</>}
                        colon={false}
                        labelAlign='left'
                        name='payEachTime'
                    >
                        <Select
                            placeholder='Mời chọn thanh toán mỗi lần'
                            showSearch
                            suffixIcon='Tháng'
                            style={{ width: 400 }}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                (
                                    option!.children as unknown as string
                                ).includes(input)
                            }
                            filterSort={(optionA, optionB) =>
                                (optionA!.children as unknown as string)
                                    .toLowerCase()
                                    .localeCompare(
                                        (
                                            optionB!
                                                .children as unknown as string
                                        ).toLowerCase()
                                    )
                            }
                        >
                            <Option value={1}>1</Option>
                            <Option value={2}>2</Option>
                            <Option value={3}>3</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <Form.Item
                        label={<>Số xe</>}
                        colon={false}
                        labelAlign='left'
                    >
                        <Input style={{ width: 400 }} />
                    </Form.Item>
                </Col>
                <Col span={8} offset={4}>
                    <Form.Item
                        label={<>Hình ảnh</>}
                        colon={false}
                        name='image'
                        labelAlign='left'
                    >
                        <Upload
                            name='avatar'
                            listType='picture-card'
                            className='avatar-uploader'
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleChange}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt='avatar'
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
                        {/*   <Dragger
                            {...{
                                fileList,
                                defaultFileList: fileList,
                                onRemove: handleRemove,
                                beforeUpload: handleBeforeUpload,
                                multiple: false,
                                onChange: handleChangeFiles,
                                listType: 'picture',
                            }}
                            style={{ width: '100%' }}
                        >
                            <p className='ant-upload-drag-icon'>
                                <InboxOutlined />
                            </p>
                            <p className='ant-upload-text'>
                                Click or drag file to this area to upload
                            </p>
                        </Dragger> */}
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default FormCreate;
