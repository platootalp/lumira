"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { X, Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, isRegisterPending } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("请输入姓名");
      return false;
    }

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("请输入有效的邮箱地址");
      return false;
    }

    if (!password) {
      setError("请输入密码");
      return false;
    }

    if (password.length < 6) {
      setError("密码长度至少为6位");
      return false;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    }
  };

  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              创建账户
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              注册以开始使用 Lumira
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="您的姓名"
                  disabled={isRegisterPending}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl",
                    "text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "transition-all duration-200",
                    "disabled:bg-slate-50 disabled:cursor-not-allowed"
                  )}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-slate-700"
              >
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isRegisterPending}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl",
                    "text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "transition-all duration-200",
                    "disabled:bg-slate-50 disabled:cursor-not-allowed"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-slate-700"
              >
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位字符"
                  disabled={isRegisterPending}
                  className={cn(
                    "w-full pl-10 pr-12 py-2.5 bg-white border rounded-xl",
                    "text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "transition-all duration-200",
                    "disabled:bg-slate-50 disabled:cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-slate-700"
              >
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  disabled={isRegisterPending}
                  className={cn(
                    "w-full pl-10 pr-12 py-2.5 bg-white border rounded-xl",
                    "text-slate-900 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "transition-all duration-200",
                    "disabled:bg-slate-50 disabled:cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isRegisterPending}
              className="w-full h-11 text-base mt-2"
            >
              {isRegisterPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                "创建账户"
              )}
            </Button>

            <div className="text-center text-sm text-slate-500">
              已有账户？{" "}
              <button
                type="button"
                onClick={handleLoginClick}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                立即登录
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
