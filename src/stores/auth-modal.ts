/**
 * 登录/注册弹窗全局状态管理
 *
 * 用于在全局控制登录弹窗和注册弹窗的显示
 * 主要用途：API 拦截到 401 错误时触发登录弹窗
 */

import { create } from 'zustand';

interface AuthModalState {
  // 登录弹窗状态
  isLoginModalOpen: boolean;
  // 注册弹窗状态
  isRegisterModalOpen: boolean;
  // 登录成功后回调（可选）
  // 登录成功后回调（可选）
  onLoginSuccess: (() => void) | undefined;

  // Actions
  openLoginModal: (onSuccess?: () => void) => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  // Initial state
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  onLoginSuccess: undefined,

  // Actions
  openLoginModal: (onSuccess) =>
    set({
      isLoginModalOpen: true,
      isRegisterModalOpen: false,
      onLoginSuccess: onSuccess,
    }),

  closeLoginModal: () =>
    set({
      isLoginModalOpen: false,
      onLoginSuccess: undefined,
    }),

  openRegisterModal: () =>
    set({
      isLoginModalOpen: false,
      isRegisterModalOpen: true,
    }),

  closeRegisterModal: () =>
    set({
      isRegisterModalOpen: false,
    }),

  switchToRegister: () =>
    set({
      isLoginModalOpen: false,
      isRegisterModalOpen: true,
    }),

  switchToLogin: () =>
    set({
      isLoginModalOpen: true,
      isRegisterModalOpen: false,
    }),
}));
