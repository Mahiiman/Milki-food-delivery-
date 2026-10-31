import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AuthPanel({ user, onAuthChange }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error

        if (data.session) {
          onAuthChange?.(data.session.user)
          setMessage('Account uumameera; seenteetta.')
        } else {
          setMessage('Account uumameera. Email kee ilaali; mirkaneessi.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        onAuthChange?.(data.user)
        setMessage('Seensa milkaaʼeera.')
      }
    } catch (error) {
      setMessage(error.message || 'Dogoggorri uumame.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    setBusy(false)
    if (error) {
      setMessage(error.message)
      return
    }
    onAuthChange?.(null)
    setMessage('Account keessaa baateetta.')
  }

  if (user) {
    return (
      <section className="auth-panel">
        <p>Account: {user.email}</p>
        <button type="button" onClick={handleSignOut} disabled={busy}>
          {busy ? 'Eegaa...' : 'Baʼi'}
        </button>
        {message && <p>{message}</p>}
      </section>
    )
  }

  return (
    <section className="auth-panel">
      <h2>{mode === 'login' ? 'Seeni' : 'Account Uumi'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Eegaa...' : mode === 'login' ? 'Seeni' : 'Account Uumi'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setMessage('')
        }}
        disabled={busy}
      >
        {mode === 'login' ? 'Account haaraa uumi' : 'Account qaba; seeni'}
      </button>
      {message && <p>{message}</p>}
    </section>
  )
}
