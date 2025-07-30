import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Pagination,
  Tooltip,
  DatePicker,
  InputNumber,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  LinkOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { projectAPI } from '../lib/api';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Projects = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // State management
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    status: '',
    priority: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  // Fetch projects with pagination
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectAPI.getProjects(filters),
    keepPreviousData: true
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: projectAPI.createProject,
    onSuccess: () => {
      message.success(t('projects.createSuccess'));
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || t('projects.createError'));
    }
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => projectAPI.updateProject(id, data),
    onSuccess: () => {
      message.success(t('projects.updateSuccess'));
      setModalVisible(false);
      setEditingProject(null);
      form.resetFields();
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || t('projects.updateError'));
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: projectAPI.deleteProject,
    onSuccess: () => {
      message.success(t('projects.deleteSuccess'));
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      message.error(error.response?.data?.detail || t('projects.deleteError'));
    }
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Process form data
      const formData = {
        ...values,
        start_date: values.dateRange?.[0]?.format('YYYY-MM-DD') || null,
        end_date: values.dateRange?.[1]?.format('YYYY-MM-DD') || null,
        team_members: values.team_members ? values.team_members.split(',').map(m => m.trim()) : [],
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : []
      };
      delete formData.dateRange;

      if (editingProject) {
        await updateProjectMutation.mutateAsync({ id: editingProject.id, data: formData });
      } else {
        await createProjectMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle edit
  const handleEdit = (project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      dateRange: project.start_date && project.end_date ? [
        dayjs(project.start_date),
        dayjs(project.end_date)
      ] : null,
      team_members: project.team_members?.join(', ') || '',
      tags: project.tags?.join(', ') || ''
    });
    setModalVisible(true);
  };

  // Handle view details
  const handleView = (project) => {
    setViewingProject(project);
    setViewModalVisible(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    deleteProjectMutation.mutate(id);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when filters change
    }));
  };

  // Handle search
  const handleSearch = (value) => {
    handleFilterChange('search', value);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      page_size: 10,
      search: '',
      status: '',
      priority: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  // Table columns
  const columns = [
    {
      title: t('projects.code'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: true,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: t('projects.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      ellipsis: true
    },
    {
      title: t('projects.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          active: 'green',
          inactive: 'orange',
          completed: 'blue'
        };
        return <Tag color={colors[status]}>{t(`projects.status.${status}`)}</Tag>;
      }
    },
    {
      title: t('projects.priority'),
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const colors = {
          low: 'default',
          medium: 'orange',
          high: 'red',
          critical: 'purple'
        };
        return <Tag color={colors[priority]}>{t(`projects.priority.${priority}`)}</Tag>;
      }
    },
    {
      title: t('projects.budget'),
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (budget) => budget ? `$${Number(budget).toLocaleString()}` : '-'
    },
    {
      title: t('projects.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('common.view')}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <Popconfirm
              title={t('projects.deleteConfirm')}
              onConfirm={() => handleDelete(record.id)}
              okText={t('common.yes')}
              cancelText={t('common.no')}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Handle table change (sorting, pagination)
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      handleFilterChange('sort_by', sorter.field);
      handleFilterChange('sort_order', sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h1 className="text-2xl font-bold m-0">{t('projects.title')}</h1>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProject(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                {t('projects.create')}
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder={t('projects.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('projects.filterByStatus')}
                value={filters.status || undefined}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="active">{t('projects.status.active')}</Option>
                <Option value="inactive">{t('projects.status.inactive')}</Option>
                <Option value="completed">{t('projects.status.completed')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('projects.filterByPriority')}
                value={filters.priority || undefined}
                onChange={(value) => handleFilterChange('priority', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="low">{t('projects.priority.low')}</Option>
                <Option value="medium">{t('projects.priority.medium')}</Option>
                <Option value="high">{t('projects.priority.high')}</Option>
                <Option value="critical">{t('projects.priority.critical')}</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetFilters}
                >
                  {t('common.reset')}
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={projectsData?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />

        {/* Pagination */}
        {projectsData && projectsData.total > 0 && (
          <div className="mt-4 text-right">
            <Pagination
              current={filters.page}
              pageSize={filters.page_size}
              total={projectsData.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`
              }
              onChange={(page, pageSize) => {
                handleFilterChange('page', page);
                if (pageSize !== filters.page_size) {
                  handleFilterChange('page_size', pageSize);
                }
              }}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? t('projects.edit') : t('projects.create')}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProject(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            priority: 'medium'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t('projects.name')}
                rules={[{ required: true, message: t('projects.nameRequired') }]}
              >
                <Input placeholder={t('projects.namePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label={t('projects.code')}
                rules={[{ required: true, message: t('projects.codeRequired') }]}
              >
                <Input placeholder={t('projects.codePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t('projects.description')}
          >
            <TextArea
              rows={3}
              placeholder={t('projects.descriptionPlaceholder')}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t('projects.status')}
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="active">{t('projects.status.active')}</Option>
                  <Option value="inactive">{t('projects.status.inactive')}</Option>
                  <Option value="completed">{t('projects.status.completed')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label={t('projects.priority')}
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="low">{t('projects.priority.low')}</Option>
                  <Option value="medium">{t('projects.priority.medium')}</Option>
                  <Option value="high">{t('projects.priority.high')}</Option>
                  <Option value="critical">{t('projects.priority.critical')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="jira_link"
                label={t('projects.jiraLink')}
              >
                <Input
                  placeholder="https://company.atlassian.net/browse/PROJECT-123"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="repository_url"
                label={t('projects.repositoryUrl')}
              >
                <Input
                  placeholder="https://github.com/company/project"
                  prefix={<GithubOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label={t('projects.budget')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="50000"
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_hours"
                label={t('projects.estimatedHours')}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="200"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label={t('projects.dateRange')}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="team_members"
                label={t('projects.teamMembers')}
              >
                <Input
                  placeholder="john@company.com, jane@company.com"
                  help={t('projects.teamMembersHelp')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tags"
                label={t('projects.tags')}
              >
                <Input
                  placeholder="AI, Machine Learning, Backend"
                  help={t('projects.tagsHelp')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingProject(null);
                  form.resetFields();
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createProjectMutation.isLoading || updateProjectMutation.isLoading}
              >
                {editingProject ? t('common.update') : t('common.create')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={t('projects.details')}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingProject(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            {t('common.close')}
          </Button>
        ]}
        width={800}
      >
        {viewingProject && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>{t('projects.name')}:</strong> {viewingProject.name}
              </Col>
              <Col span={12}>
                <strong>{t('projects.code')}:</strong> <Tag color="blue">{viewingProject.code}</Tag>
              </Col>
              <Col span={12}>
                <strong>{t('projects.status')}:</strong>{' '}
                <Tag color={viewingProject.status === 'active' ? 'green' : 'orange'}>
                  {t(`projects.status.${viewingProject.status}`)}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>{t('projects.priority')}:</strong>{' '}
                <Tag color={viewingProject.priority === 'high' ? 'red' : 'orange'}>
                  {t(`projects.priority.${viewingProject.priority}`)}
                </Tag>
              </Col>
              {viewingProject.description && (
                <Col span={24}>
                  <strong>{t('projects.description')}:</strong>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    {viewingProject.description}
                  </div>
                </Col>
              )}
              {viewingProject.budget && (
                <Col span={12}>
                  <strong>{t('projects.budget')}:</strong> ${Number(viewingProject.budget).toLocaleString()}
                </Col>
              )}
              {viewingProject.estimated_hours && (
                <Col span={12}>
                  <strong>{t('projects.estimatedHours')}:</strong> {viewingProject.estimated_hours}h
                </Col>
              )}
              {viewingProject.start_date && (
                <Col span={12}>
                  <strong>{t('projects.startDate')}:</strong> {dayjs(viewingProject.start_date).format('DD/MM/YYYY')}
                </Col>
              )}
              {viewingProject.end_date && (
                <Col span={12}>
                  <strong>{t('projects.endDate')}:</strong> {dayjs(viewingProject.end_date).format('DD/MM/YYYY')}
                </Col>
              )}
              {viewingProject.jira_link && (
                <Col span={24}>
                  <strong>{t('projects.jiraLink')}:</strong>{' '}
                  <a href={viewingProject.jira_link} target="_blank" rel="noopener noreferrer">
                    {viewingProject.jira_link}
                  </a>
                </Col>
              )}
              {viewingProject.repository_url && (
                <Col span={24}>
                  <strong>{t('projects.repositoryUrl')}:</strong>{' '}
                  <a href={viewingProject.repository_url} target="_blank" rel="noopener noreferrer">
                    {viewingProject.repository_url}
                  </a>
                </Col>
              )}
              {viewingProject.team_members && viewingProject.team_members.length > 0 && (
                <Col span={24}>
                  <strong>{t('projects.teamMembers')}:</strong>
                  <div className="mt-2">
                    {viewingProject.team_members.map((member, index) => (
                      <Tag key={index} className="mb-1">{member}</Tag>
                    ))}
                  </div>
                </Col>
              )}
              {viewingProject.tags && viewingProject.tags.length > 0 && (
                <Col span={24}>
                  <strong>{t('projects.tags')}:</strong>
                  <div className="mt-2">
                    {viewingProject.tags.map((tag, index) => (
                      <Tag key={index} color="blue" className="mb-1">{tag}</Tag>
                    ))}
                  </div>
                </Col>
              )}
              <Col span={12}>
                <strong>{t('projects.createdAt')}:</strong> {dayjs(viewingProject.created_at).format('DD/MM/YYYY HH:mm')}
              </Col>
              <Col span={12}>
                <strong>{t('projects.updatedAt')}:</strong> {dayjs(viewingProject.updated_at).format('DD/MM/YYYY HH:mm')}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Projects;

