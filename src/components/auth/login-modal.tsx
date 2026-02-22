"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { X, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isLoginPending } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }

    if (!password) {
      setError("请输入密码");
      return;
    }

    try {
      await login({ email: email.trim(), password });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    }
  };

  const handleRegisterClick = () => {
    onClose();
    onRegisterClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              欢迎回来
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              登录您的账户以继续
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoginPending}
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
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入您的密码"
                  disabled={isLoginPending}
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

            <Button
              type="submit"
              disabled={isLoginPending}
              className="w-full h-11 text-base"
            >
              {isLoginPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>

            <div className="text-center text-sm text-slate-500">
              还没有账户？{" "}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                立即注册
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
