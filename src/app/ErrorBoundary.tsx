import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Dungeon Core failed to start:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="startup-panel error-panel" role="alert">
          <h1>Dungeon Core failed to start.</h1>
          <p>
            Something went wrong while loading the app. Check Firebase{" "}
            <code>.env</code> values and the browser console for details.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
