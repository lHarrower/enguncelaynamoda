'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              AYNAMODA
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-700">Demo Kullanıcı</span>
            <Button variant="outline" size="sm">
              Çıkış
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Hoş geldin! 👋
          </h1>
          <p className="text-neutral-600">
            Gardırobunda neler oluyor, hemen göz atalım.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Toplam Kıyafet</p>
                <p className="text-2xl font-bold text-neutral-900">24</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👗</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Kombinler</p>
                <p className="text-2xl font-bold text-neutral-900">8</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Kategoriler</p>
                <p className="text-2xl font-bold text-neutral-900">6</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Bu Hafta Eklenen</p>
                <p className="text-2xl font-bold text-neutral-900">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Hızlı İşlemler
            </h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                ➕ Yeni Kıyafet Ekle
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                ✨ Kombin Oluştur
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                🔍 Gardırobunda Ara
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-soft p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">
              💡 Stil İpucu
            </h2>
            <p className="text-sm opacity-90 mb-4">
              Bu haftanın trend rengi: Lavanta! Gardırobunuzda 
              mor tonlarını aramayı deneyin ve yeni kombinler keşfedin.
            </p>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary-600">
              Keşfet
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 