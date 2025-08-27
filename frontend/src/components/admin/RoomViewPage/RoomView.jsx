// src/pages/RoomView.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Avatar,
  Badge
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  HomeOutlined,
  StarFilled,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const RoomView = () => {
  const location = useLocation();
  const room = location.state?.room;

  if (!room) {
    return (
      <div className="pl-64 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="text-center shadow-2xl rounded-2xl border-0">
          <div className="py-12">
            <HomeOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={3} type="secondary">No room data found</Title>
            <Text type="secondary">Please select a room to view details</Text>
          </div>
        </Card>
      </div>
    );
  }

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Mock amenities
  const amenities = [
    { icon: <WifiOutlined />, name: 'Free WiFi' },
    { icon: <CarOutlined />, name: 'Parking' },
    { icon: <CoffeeOutlined />, name: 'Mini Bar' },
    { icon: <SafetyOutlined />, name: 'Safe' }
  ];

  return (
    <div className="pl-70 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-6">
          <Space align="center" className="mb-2">
            <Badge.Ribbon text="Premium" color="gold">
              <Title level={1} className="mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Room {room.roomNumber}
              </Title>
            </Badge.Ribbon>
          </Space>
          <Space>
            <Tag color="blue" className="text-sm px-3 py-1 rounded-full">
              {room.type}
            </Tag>
            <Space>
              <StarFilled className="text-yellow-400" />
              <StarFilled className="text-yellow-400" />
              <StarFilled className="text-yellow-400" />
              <StarFilled className="text-yellow-400" />
              <StarFilled className="text-yellow-400" />
              <Text type="secondary">(4.9)</Text>
            </Space>
          </Space>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Image */}
          <Col xs={24} lg={14}>
            <Card 
              className="overflow-hidden shadow-2xl border-0 rounded-3xl"
              bodyStyle={{ padding: 0 }}
            >
              <div className="relative group">
                <img
                  src={room.image ? `${BASE_URL}${room.image}` : '/placeholder.png'}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-6 left-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-2xl backdrop-blur-sm">
                    <Text strong className="text-white text-lg">
                      Room {room.roomNumber}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Details */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              
              {/* Room Type Card */}
              <Card 
                className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50"
                bodyStyle={{ padding: '24px' }}
              >
                <Title level={2} className="mb-4 text-gray-800">
                  {room.type}
                </Title>
                {room.description && (
                  <Paragraph className="text-gray-600 text-base leading-relaxed">
                    {room.description}
                  </Paragraph>
                )}
              </Card>

              {/* Key Information */}
              <Card 
                title={
                  <Space>
                    <Avatar style={{ backgroundColor: '#1677ff' }} icon={<HomeOutlined />} />
                    <Text strong className="text-lg">Room Details</Text>
                  </Space>
                }
                className="shadow-xl rounded-2xl border-0"
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <Space>
                        <UserOutlined className="text-blue-600 text-lg" />
                        <div>
                          <div className="text-blue-600 font-semibold">Capacity</div>
                          <div className="text-gray-800 font-bold">{room.capacity} Guests</div>
                        </div>
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <Space>
                        <DollarOutlined className="text-green-600 text-lg" />
                        <div>
                          <div className="text-green-600 font-semibold">Price</div>
                          <div className="text-gray-800 font-bold">₨{room.price.toLocaleString()}</div>
                          <div className="text-gray-500 text-sm">per night</div>
                        </div>
                      </Space>
                    </div>
                  </Col>
                  {room.hotelId && (
                    <Col span={24}>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <Space>
                          <HomeOutlined className="text-purple-600 text-lg" />
                          <div>
                            <div className="text-purple-600 font-semibold">Hotel ID</div>
                            <div className="text-gray-800 font-bold">#{room.hotelId}</div>
                          </div>
                        </Space>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>

              {/* Amenities */}
              <Card 
                title={
                  <Space>
                    <Avatar style={{ backgroundColor: '#52c41a' }} icon={<SafetyOutlined />} />
                    <Text strong className="text-lg">Amenities</Text>
                  </Space>
                }
                className="shadow-xl rounded-2xl border-0"
              >
                <Row gutter={[12, 12]}>
                  {amenities.map((amenity, index) => (
                    <Col span={12} key={index}>
                      <Space className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-indigo-600 text-lg">{amenity.icon}</span>
                        <Text>{amenity.name}</Text>
                      </Space>
                    </Col>
                  ))}
                </Row>
              </Card>

            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RoomView;
