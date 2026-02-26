'use client';

import { useEffect, useRef } from 'react';
import { LoginModal } from './login-modal';
import { RegisterModal } from './register-modal';
import { useAuthModalStore } from '@/stores/auth-modal';
import { apiClient } from '@/lib/api-client';

/**
 * 全局认证弹窗容器
 *
 * 放置在 RootLayout 中，用于全局控制登录/注册弹窗的显示
 * 当 API 客户端拦截到 401 错误时触发登录弹窗
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

  // 使用 ref 跟踪是否是初始挂载，避免初始加载时弹出登录框
  const isInitialMount = useRef(true);

  // 在组件挂载时设置 401 错误处理器
  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      // 只有在非初始挂载时才打开登录弹窗
      if (!isInitialMount.current) {
        openLoginModal();
      }
    });

    // 标记初始挂载完成
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 1000); // 1秒后允许 401 触发弹窗

    return () => clearTimeout(timer);
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
