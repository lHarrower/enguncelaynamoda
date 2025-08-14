// ignore-warnings imported at root layout
// app/index.tsx
import React, { useState } from 'react'
import { View, Text, Button, ScrollView } from 'react-native'
import { supa } from '../src/lib/supa'

const SMOKE_EMAIL = 'hkillibacak0+smoke-20250813151337@gmail.com'
const SMOKE_PASSWORD = 'Smoke!20250813151337'

const FN_URL = 'https://sntlqqerajehwgmjbkgw.functions.supabase.co/ai-analysis'
const IMG = 'https://sntlqqerajehwgmjbkgw.supabase.co/storage/v1/object/public/wardrobe/test.png'

export default function Home() {
  const [out, setOut] = useState<string>('Hazır')

  const run = async () => {
    try {
  setOut('Login oluyor...')
  // 1) dev için smoke login
      const login = await supa.auth.signInWithPassword({ email: SMOKE_EMAIL, password: SMOKE_PASSWORD })
      if (login.error) throw login.error

      const accessToken = login.data.session?.access_token
  if (!accessToken) throw new Error('Token alınamadı')

  setOut((p) => p + '\nLogin OK. DB insert...')

  // 2) kullanıcının kendi item satırını ekle
      const { data: item, error: insErr } = await supa
        .from('wardrobe_items')
        .insert({
          user_id: login.data.user.id,
          category: 'tops',
          name: 'smoke-from-app',
          image_uri: IMG,
          processed_image_uri: IMG
        })
        .select('id')
        .single()

      if (insErr) throw insErr
      const itemId = item!.id as string

  setOut((p) => p + `\nInsert OK. itemId=${itemId}\nEdge çağrısı...`)

  // 3) edge function çağır
      const resp = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: IMG, itemId })
      })

      const json = await resp.json()
      if (!resp.ok) {
        throw new Error(`ai-analysis ${resp.status}: ${JSON.stringify(json)}`)
      }

  // 4) sonucu göster
      setOut((p) => p + `\nai-analysis OK:\n${JSON.stringify(json, null, 2)}`)
    } catch (e: any) {
      setOut(`HATA:\n${e?.message ?? String(e)}`)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>AynaModa - Test</Text>
      <Button title="Analiz Et (smoke ile)" onPress={run} />
      <View style={{ height: 12 }} />
      <Text selectable style={{ fontFamily: 'Courier', marginTop: 8 }}>{out}</Text>
    </ScrollView>
  )
}

