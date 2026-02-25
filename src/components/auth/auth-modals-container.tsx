'use client';

import { useEffect } from 'react';
import { LoginModal } from './login-modal';
import { RegisterModal } from './register-modal';
import { useAuthModalStore } from '@/stores/auth-modal';
import { apiClient } from '@/lib/api-client';

/**
 * 全局认证弹窗容器
 *
 * 放置在 RootLayout 中，用于全局控制登录/注册弹窗的显示
 * 当 API 客户端拦截到 401 错误时，通过全局状态触发登录弹窗
 */
export function AuthModalsContainer() {
  const {
    isLoginModalOpen,
    isRegisterModalOpen,
    closeLoginModal,
    closeRegisterModal,
    switchToRegister,
    switchToLogin,
    openLoginModal,
  } = useAuthModalStore();

  // 在组件挂载时设置 401 错误处理器
  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      openLoginModal();
    });
  }, [openLoginModal]);

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onRegisterClick={switchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        onLoginClick={switchToLogin}
      />
    </>
  );
}
