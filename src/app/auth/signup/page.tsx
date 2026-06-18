'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Submitting signup request...')
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      console.log('Response status:', response.status)

      const data = await response.json()

      if (!response.ok) {
        console.error('Signup failed:', data)
        setError(data.error || 'Signup failed')
      } else {
        console.log('Signup successful:', data)
        // Store user info and redirect
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('User stored in localStorage:', JSON.stringify(data.user))
        router.replace('/')
      }
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand/70 p-4">
      <Card className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl shadow-brand/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Join your team to start managing tasks
          </CardDescription>
          <div className="text-sm text-amber-400 bg-amber-500/10 rounded p-3 mb-4 border border-amber-500/30">
            <p className="font-medium mb-1">💡 Role Information</p>
            <ul className="space-y-1 text-slate-300">
              <li>• First user can be Administrator</li>
              <li>• To create an Administrator account, select "Administrator" role</li>
              <li>• Other users will be Employees by default</li>
            </ul>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 rounded-md border border-red-500/30">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black/30 border-slate-700/50 text-slate-300 placeholder:text-slate-500 focus:border-brand/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black/30 border-slate-700/50 text-slate-300 placeholder:text-slate-500 focus:border-brand/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-300">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger id="role" className="mt-1 bg-black/30 border-slate-700/50 text-slate-300 placeholder:text-slate-500 focus:border-brand/50">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700/50">
                  <SelectItem value="EMPLOYEE" className="text-slate-300 focus:bg-slate-800 focus:text-slate-100">Employee</SelectItem>
                  <SelectItem value="ADMIN" className="text-slate-300 focus:bg-slate-800 focus:text-slate-100">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black/30 border-slate-700/50 text-slate-300 placeholder:text-slate-500 focus:border-brand/50"
              />
              <p className="text-xs text-slate-500">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="•••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black/30 border-slate-700/50 text-slate-300 placeholder:text-slate-500 focus:border-brand/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-brand to-brand/70 hover:from-brand hover:to-brand/70 shadow-lg shadow-brand/25 disabled:bg-brand disabled:shadow-brand/30"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-brand hover:text-brand hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

