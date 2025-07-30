import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const { access_token, refresh_token } = response.data;
      
      // Set token immediately for next request
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Get user info
      authAPI.getCurrentUser()
        .then((userResponse) => {
          login(userResponse.data, { access_token, refresh_token });
          message.success(t('auth.loginSuccess'));
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Failed to get user info:', error);
          message.error(t('auth.loginError'));
        });
    },
    onError: (error) => {
      console.error('Login error:', error);
      message.error(error.response?.data?.detail || t('auth.loginError'));
    },
  });

  const handleSubmit = (values) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            AI Agents Monitoring
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.login')}
          </p>
        </div>
        
        <Card className="shadow-lg">
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                {
                  required: true,
                  message: `${t('auth.username')} ${t('common.error')}`,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t('auth.username')}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[
                {
                  required: true,
                  message: `${t('auth.password')} ${t('common.error')}`,
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t('auth.password')}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>{t('auth.rememberMe')}</Checkbox>
                </Form.Item>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loginMutation.isPending}
              >
                {t('auth.login')}
              </Button>
            </Form.Item>

            <Divider plain>
              <span className="text-gray-500 text-sm">hoặc</span>
            </Divider>

            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{' '}
              </span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {t('auth.register')}
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;

