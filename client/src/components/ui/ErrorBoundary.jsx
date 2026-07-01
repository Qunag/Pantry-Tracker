"use client";
// src/components/ui/ErrorBoundary.jsx

import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * React Error Boundary — bắt lỗi runtime từ bất kỳ component con nào.
 * Phải là Class Component theo React API.
 *
 * Props:
 *   children     : ReactNode
 *   fallbackTitle: string  (tùy chọn — tiêu đề khi lỗi)
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log ra console để dễ debug
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev  = process.env.NODE_ENV === "development";
    const title  = this.props.fallbackTitle || "Có lỗi xảy ra";
    const errMsg = this.state.error?.message || "Lỗi không xác định";

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#0f0f1a" }}
      >
        <div
          className="w-full max-w-md text-center animate-fade-in"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "2.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/50 text-sm mb-5">
            Trang này gặp sự cố không mong muốn. Bạn có thể thử tải lại hoặc quay về trang chủ.
          </p>

          {/* Dev: hiện stack trace */}
          {isDev && (
            <div
              className="text-left text-xs text-red-300/80 mb-5 p-3 rounded-xl overflow-auto max-h-32"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p className="font-mono font-bold mb-1">{errMsg}</p>
              {this.state.error?.stack && (
                <pre className="whitespace-pre-wrap break-all text-red-400/60 text-[10px]">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              Thử lại
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tải lại trang
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <Home className="w-3.5 h-3.5" /> Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }
}
