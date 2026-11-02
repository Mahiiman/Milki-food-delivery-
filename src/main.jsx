import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showRuntimeError(message) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = ''
  const panel = document.createElement('div')
  panel.style.cssText = 'padding:24px;font:16px Arial,sans-serif;color:#222;white-space:pre-wrap;overflow-wrap:anywhere'
  const title = document.createElement('h2')
  title.textContent = 'MILKI app error'
  const detail = document.createElement('p')
  detail.textContent = String(message || 'Unknown error')
  panel.append(title, detail)
  root.appendChild(panel)
}

window.addEventListener('error', event => {
  showRuntimeError(event.error?.stack || event.message || 'JavaScript error')
})

window.addEventListener('unhandledrejection', event => {
  showRuntimeError(event.reason?.stack || event.reason?.message || event.reason || 'Unhandled promise rejection')
})

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('MILKI React render error:', error)
  }

  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: 24, fontFamily: 'Arial, sans-serif', color: '#222', overflowWrap: 'anywhere' }
      },
        React.createElement('h2', null, 'MILKI app error'),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap' } }, this.state.error.stack || this.state.error.message)
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  showRuntimeError('HTML keessatti #root hin argamne.')
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>
  )
}
