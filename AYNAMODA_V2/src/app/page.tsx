'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <main className="relative min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-display font-bold gradient-text">
              AYNAMODA
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-neutral-600 hover:text-primary-600 transition-colors">
              Özellikler
            </Link>
            <Link href="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">
              Hakkımızda
            </Link>
            <Link href="/auth/signin" className="text-neutral-600 hover:text-primary-600 transition-colors">
              Giriş Yap
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full hover:shadow-medium transition-all duration-300"
            >
              Başla
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-neutral-800"></div>
              <div className="w-full h-0.5 bg-neutral-800"></div>
              <div className="w-full h-0.5 bg-neutral-800"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="gradient-text">Gardıropunuz</span>
              <br />
              <span className="text-neutral-800">Artık Akıllı</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Kişisel stil danışmanınız cebinizde. Yapay zeka ile kıyafetlerinizi organize edin, 
              yeni kombinler keşfedin, stilinizi geliştirin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link 
                href="/auth/signup"
                className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-large transition-all duration-300 animate-bounce-soft"
              >
                Ücretsiz Başla
              </Link>
              <Link 
                href="/demo"
                className="w-full sm:w-auto border-2 border-neutral-300 text-neutral-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-primary-300 hover:text-primary-600 transition-all duration-300"
              >
                Demo İzle
              </Link>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl shadow-large overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl">👗</span>
                    </div>
                    <p className="text-neutral-600 text-lg">
                      Akıllı Gardırop Deneyimi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-neutral-800">
              Neden <span className="gradient-text">AYNAMODA</span>?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Gardırobunuzdaki gizli potansiyeli ortaya çıkaran akıllı özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">AI Analiz</h3>
              <p className="text-neutral-600 leading-relaxed">
                Kıyafetlerinizi fotoğraflayın, yapay zeka otomatik olarak kategorize etsin, 
                etiketlesin ve organize etsin.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">Akıllı Arama</h3>
              <p className="text-neutral-600 leading-relaxed">
                "Mavi gömleklerim", "kış kıyafetleri" gibi doğal dille arama yapın. 
                İstediğinizi anında bulun.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-neutral-800">Kombin Önerileri</h3>
              <p className="text-neutral-600 leading-relaxed">
                Gardırobunuzdaki parçalardan yeni kombinler keşfedin. 
                Her gün farklı bir stil önerisi alın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-neutral-800">
            Stilinizi <span className="gradient-text">Keşfetmeye</span> Hazır mısınız?
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Gardırobunuzdaki sınırsız potansiyeli açığa çıkarın. 
            Hemen başlayın, ilk 30 gün tamamen ücretsiz.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-10 py-4 rounded-full text-xl font-semibold hover:shadow-large transition-all duration-300"
          >
            Hemen Başla - Ücretsiz
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-display font-bold">AYNAMODA</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                Şartlar
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                İletişim
              </Link>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 AYNAMODA. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  )
} 