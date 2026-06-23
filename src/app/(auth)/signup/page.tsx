import React from 'react'
import { RegisterForm } from '@/components/features/auth/RegisterForm'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  )
}
