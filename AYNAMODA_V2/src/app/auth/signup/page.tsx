'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validateEmail, validatePassword } from '@/lib/utils'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir'
    }

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Kullanım şartlarını kabul etmelisiniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      console.log('Sign up with:', formData)
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Hesap oluşturuldu! (Demo)')
    } catch (error) {
      setErrors({ general: 'Hesap oluşturulurken bir hata oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-3xl font-display font-bold gradient-text">
              AYNAMODA
            </span>
          </Link>
          <p className="text-neutral-600 mt-2">
            Ücretsiz hesap oluşturun
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-large p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <Input
              label="Ad Soyad"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              placeholder="Adınız Soyadınız"
              required
            />

            <Input
              label="E-posta Adresi"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="ornek@email.com"
              required
            />

            <Input
              label="Şifre"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="••••••••"
              required
              helperText="En az 8 karakter, büyük/küçük harf, rakam içermelidir"
            />

            <Input
              label="Şifre Tekrarı"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">
                  <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                    Kullanım Şartları
                  </Link>
                  {' '}ve{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                    Gizlilik Politikası
                  </Link>
                  'nı kabul ediyorum.
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-600 mt-6">
            Zaten hesabınız var mı?{' '}
            <Link 
              href="/auth/signin"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 