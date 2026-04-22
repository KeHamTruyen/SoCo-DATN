import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
    children: ReactNode;
}

interface AppErrorBoundaryState {
    hasError: boolean;
}

export class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    state: AppErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Unhandled UI error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6 text-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Something went wrong
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please refresh the page and try again.
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
