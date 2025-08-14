import React, { useState } from "react";
import { View, Text, Button, Image, ScrollView } from "react-native";
import { createClient } from "@supabase/supabase-js";

// .env (EXPO_PUBLIC_*) değerleri:
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function AiTestScreen() {
  const [log, setLog] = useState<string>("Hazır.");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>("");

  const append = (s: string) => setLog((prev) => prev + "\n" + s);

  const run = async () => {
    setLog("Başlıyor...");
    setJsonText("");
    setImgUrl(null);

    try {
      // 1) Oturum
      append("Oturum alınıyor...");
      const { data: sess, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;
      const token = sess?.session?.access_token ?? "";
      if (!token) { append("Oturum yok. Lütfen önce uygulamadaki giriş akışıyla giriş yap."); return; }

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Kullanıcı bulunamadı");

      // 2) Storage test görseli
      const IMG = `${supabaseUrl}/storage/v1/object/public/wardrobe/test.png`;
      append("DB insert...");

      // 3) wardrobe_items insert
      const { data: row, error: insErr } = await supabase
        .from("wardrobe_items")
        .insert({
          user_id: uid,
          category: "tops",
          name: "ai-test",
          image_uri: IMG,
          processed_image_uri: IMG,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      const itemId: string = row!.id as string;
      append("Insert OK. itemId=" + itemId);

      // 4) Edge Function çağrısı
      append("Edge çağrısı…");
      const FN_URL = "https://sntlqqerajehwgmjbkgw.functions.supabase.co/ai-analysis";
      const resp = await fetch(FN_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnon,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: IMG, itemId }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(`ai-analysis ${resp.status}: ${JSON.stringify(json)}`);

      append("ai-analysis OK");
      setJsonText(JSON.stringify(json, null, 2));
      if (json?.cloudinary?.url) setImgUrl(json.cloudinary.url);
    } catch (e: any) {
      append("HATA: " + (e?.message ?? String(e)));
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        AynaModa — AI Test
      </Text>
      <Button title="ANALİZ ET (TEST PNG)" onPress={run} />
      <Text style={{ marginTop: 16, fontFamily: "monospace" }}>{log}</Text>
      {imgUrl ? (
        <View style={{ marginTop: 16 }}>
          <Text>Cloudinary Görseli:</Text>
          <Image source={{ uri: imgUrl }} style={{ width: "100%", height: 260, borderRadius: 12, marginTop: 8 }} resizeMode="cover" />
        </View>
      ) : null}
      {jsonText ? (
        <View style={{ marginTop: 16 }}>
          <Text>Sonuç JSON:</Text>
          <Text selectable style={{ fontFamily: "monospace", marginTop: 8 }}>{jsonText}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
