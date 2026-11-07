import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Renders the error UI. `reset` clears the error so the children are mounted (and the model re-requested) again. */
  fallback: (error: Error, reset: () => void) => ReactNode
  resetKey?: string
}
interface State { error: Error | null }

/** Catches 3D render and model-loading errors so a missing or broken model never crashes the page. */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[CYMOR] 3D viewer error:', error.message, info.componentStack?.split('\n')[1]?.trim())
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  reset = () => this.setState({ error: null })

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children
  }
}
