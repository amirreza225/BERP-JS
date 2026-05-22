import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChartPage } from "./pages/ChartPage.jsx";
import { Home } from "./pages/Home.jsx";
import { LivePage } from "./pages/LivePage.jsx";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 px-4 py-10 text-red-200">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-2 text-lg font-bold">Something went wrong</h1>
            <pre className="whitespace-pre-wrap text-sm">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/live" element={<LivePage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
