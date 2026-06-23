import React from 'react'
import { LoginForm } from '@/components/features/auth/LoginForm'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}
