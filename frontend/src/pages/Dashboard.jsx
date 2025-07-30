import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Button } from 'antd';
import {
  ProjectOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, tasksAPI } from '../lib/api';
import { Line, Bar, Pie } from '@ant-design/plots';

const Dashboard = () => {
  const { t } = useTranslation();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsAPI.getDashboard({ days: 30 }),
  });

  // Fetch recent tasks
  const { data: recentTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () => tasksAPI.getAll({ limit: 10 }),
  });

  const stats = dashboardData?.data || {};
  const recentTasks = recentTasksData?.data || [];

  // Chart configurations
  const tokenUsageConfig = {
    data: [
      { type: 'Input Tokens', value: stats.costs?.total_input_tokens || 0 },
      { type: 'Output Tokens', value: stats.costs?.total_output_tokens || 0 },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const taskStatusConfig = {
    data: [
      { status: t('tasks.status'), completed: stats.tasks?.completed || 0 },
      { status: t('common.error'), completed: stats.tasks?.failed || 0 },
      { status: 'Pending', completed: stats.tasks?.recent - stats.tasks?.completed - stats.tasks?.failed || 0 },
    ],
    xField: 'status',
    yField: 'completed',
    color: ['#52c41a', '#ff4d4f', '#faad14'],
  };

  // Recent tasks table columns
  const taskColumns = [
    {
      title: t('tasks.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: t('tasks.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', icon: <CheckCircleOutlined /> },
          failed: { color: 'error', icon: <CloseCircleOutlined /> },
          pending: { color: 'warning', icon: <ClockCircleOutlined /> },
          running: { color: 'processing', icon: <ThunderboltOutlined /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: t('tasks.duration'),
      dataIndex: 'duration_seconds',
      key: 'duration',
      render: (seconds) => {
        if (!seconds) return '-';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
      },
    },
    {
      title: t('tasks.cost'),
      dataIndex: 'cost_usd',
      key: 'cost',
      render: (cost) => `$${parseFloat(cost || 0).toFixed(4)}`,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button type="link" size="small">
          {t('common.view')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('nav.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tổng quan hệ thống AI Agents trong 30 ngày qua
          </p>
        </div>
        <Button type="primary" icon={<FileTextOutlined />}>
          Xuất báo cáo
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('projects.totalTasks')}
              value={stats.tasks?.total || 0}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('projects.totalProjects')}
              value={stats.projects?.total || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('analytics.totalCost')}
              value={stats.costs?.total_cost || 0}
              prefix={<DollarOutlined />}
              precision={4}
              valueStyle={{ color: '#faad14' }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.tasks?.success_rate || 0}
              prefix={
                stats.tasks?.success_rate >= 80 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              }
              precision={1}
              valueStyle={{
                color: stats.tasks?.success_rate >= 80 ? '#52c41a' : '#ff4d4f',
              }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Token Usage Distribution"
            extra={<Button type="link">Chi tiết</Button>}
          >
            <Pie {...tokenUsageConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Task Status Overview"
            extra={<Button type="link">Chi tiết</Button>}
          >
            <Bar {...taskStatusConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* File Operations Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Files Created"
              value={stats.files?.created || 0}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={
                stats.files?.total > 0
                  ? Math.round((stats.files?.created / stats.files?.total) * 100)
                  : 0
              }
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Files Modified"
              value={stats.files?.modified || 0}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress
              percent={
                stats.files?.total > 0
                  ? Math.round((stats.files?.modified / stats.files?.total) * 100)
                  : 0
              }
              strokeColor="#faad14"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <Statistic
              title="Files Deleted"
              value={stats.files?.deleted || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress
              percent={
                stats.files?.total > 0
                  ? Math.round((stats.files?.deleted / stats.files?.total) * 100)
                  : 0
              }
              strokeColor="#ff4d4f"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks */}
      <Card
        title={t('analytics.recentTasks')}
        extra={<Button type="link">Xem tất cả</Button>}
      >
        <Table
          columns={taskColumns}
          dataSource={recentTasks}
          rowKey="id"
          loading={tasksLoading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;

