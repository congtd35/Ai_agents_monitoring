import React from 'react';
import { Form, Input, Button, Card, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      message.success(t('auth.registerSuccess'));
      navigate('/login');
    },
    onError: (error) => {
      console.error('Register error:', error);
      message.error(error.response?.data?.detail || t('auth.registerError'));
    },
  });

  const handleSubmit = (values) => {
    registerMutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
      full_name: values.fullName,
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
            {t('auth.register')}
          </p>
        </div>
        
        <Card className="shadow-lg">
          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="fullName"
              label={t('auth.fullName')}
              rules={[
                {
                  required: true,
                  message: `${t('auth.fullName')} ${t('common.error')}`,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t('auth.fullName')}
              />
            </Form.Item>

            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                {
                  required: true,
                  message: `${t('auth.username')} ${t('common.error')}`,
                },
                {
                  min: 3,
                  message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t('auth.username')}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('auth.email')}
              rules={[
                {
                  required: true,
                  message: `${t('auth.email')} ${t('common.error')}`,
                },
                {
                  type: 'email',
                  message: 'Email không hợp lệ',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder={t('auth.email')}
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
                {
                  min: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
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

            <Form.Item
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: `${t('auth.confirmPassword')} ${t('common.error')}`,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder={t('auth.confirmPassword')}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={registerMutation.isPending}
              >
                {t('auth.register')}
              </Button>
            </Form.Item>

            <Divider plain>
              <span className="text-gray-500 text-sm">hoặc</span>
            </Divider>

            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400">
                Đã có tài khoản?{' '}
              </span>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {t('auth.login')}
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;

