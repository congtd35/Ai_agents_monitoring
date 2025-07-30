import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Switch, Select, Button, theme } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useAppStore } from '../../lib/store';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const MainLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, theme: currentTheme, toggleTheme, language, setLanguage } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { token } = theme.useToken();

  // Menu items
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('nav.dashboard'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: t('nav.projects'),
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: t('nav.tasks'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: t('nav.analytics'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('nav.profile'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout,
    },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const handleThemeToggle = (checked) => {
    toggleTheme();
    // Apply theme to document
    document.documentElement.className = checked ? 'dark' : '';
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={256}
        className="shadow-lg"
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                AI Agents Monitor
              </span>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
          style={{
            background: 'transparent',
          }}
        />
      </Sider>
      
      <Layout>
        <Header
          className="flex items-center justify-between px-4 shadow-sm"
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select
              value={language}
              onChange={handleLanguageChange}
              className="w-20"
              size="small"
              suffixIcon={<GlobalOutlined />}
            >
              <Option value="vi">VI</Option>
              <Option value="en">EN</Option>
            </Select>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <BulbOutlined className="text-gray-500" />
              <Switch
                checked={currentTheme === 'dark'}
                onChange={handleThemeToggle}
                size="small"
              />
            </div>
            
            {/* User Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.full_name || user?.username}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          className="m-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm"
          style={{
            background: token.colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

