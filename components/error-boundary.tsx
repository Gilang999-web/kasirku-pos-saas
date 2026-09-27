"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-white border border-red-100 rounded-xl p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-ink-primary">
              {this.props.fallbackTitle || "Komponen Gagal Dimuat"}
            </h4>
            <p className="text-xs text-ink-secondary">
              {this.props.fallbackMessage ||
                "Terjadi kesalahan pada bagian ini. Data lainnya tetap aman."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white text-xs font-medium rounded-lg hover:bg-terracotta-600 active:scale-[0.98] transition-all min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang Bagian Ini
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
