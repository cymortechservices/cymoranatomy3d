import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App error', error, info.componentStack) }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto mt-20 max-w-md rounded-2xl border border-rose-400/40 bg-ink-800 p-6 text-center">
        <h1 className="font-display text-xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-text-dim">This page hit an unexpected error. Your saved data is safe.</p>
        <a href="/" className="mt-4 inline-block rounded-xl bg-cyan-brand px-4 py-2 text-sm font-semibold text-ink-900">Back to home</a>
      </div>
    )
  }
}
