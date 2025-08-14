import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Image, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const FN_URL = "https://sntlqqerajehwgmjbkgw.functions.supabase.co/ai-analysis";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export default function AnalyzeDemoScreen() {
  // Pre-fill with a known example ID and the test image in storage (user can change).
  const [itemId, setItemId] = useState<string>("8d6c7e3e-9b82-4da7-9827-accfb4365e7f");
  const [imageUrl, setImageUrl] = useState<string>(
    `${SUPABASE_URL}/storage/v1/object/public/wardrobe/test.png`
  );

  const [loading, setLoading] = useState(false);
  const [cloudUrl, setCloudUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<null | {
    mainCategory?: string;
    subCategory?: string;
    dominantColors?: string[];
    detectedTags?: string[];
  }>(null);

  const shownImage = useMemo(() => cloudUrl ?? imageUrl, [cloudUrl, imageUrl]);

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setAnalysis(null);

      // 1) Get session token
      const { data: sess, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw new Error(`Session error: ${sessErr.message}`);
      const token = sess.session?.access_token;
      if (!token) throw new Error("No access token (are you logged in?)");

      // 2) Call Edge Function
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl, itemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Function error");

      const newCloud = json?.cloudinary?.url ?? null;
      const newAnalysis = json?.analysis ?? null;

      setCloudUrl(newCloud);
      setAnalysis(newAnalysis);

      // 3) PATCH DB row
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/wardrobe_items?id=eq.${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
        },
        body: JSON.stringify({
          processed_image_uri: newCloud ?? imageUrl,
          ai_analysis_data: newAnalysis,
        }),
      });

      if (!patchRes.ok) {
        const txt = await patchRes.text();
        console.warn("PATCH warning:", txt);
      }

      Alert.alert("Done", "Analysis complete ✅");
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "Analyze failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: "white", minHeight: "100%" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Analyze Demo</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Item ID</Text>
        <TextInput
          value={itemId}
          onChangeText={setItemId}
          placeholder="wardrobe_items.id"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10 }}
          autoCapitalize="none"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Image URL</Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://.../your-image.png"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10 }}
          autoCapitalize="none"
        />
      </View>

      <Pressable
        onPress={runAnalysis}
        disabled={loading || !itemId || !imageUrl}
        style={{
          backgroundColor: "#2563eb",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          opacity: loading || !itemId || !imageUrl ? 0.6 : 1,
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", fontWeight: "700" }}>Analiz Et</Text>}
      </Pressable>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Preview</Text>
        <Image
          source={{ uri: shownImage }}
          style={{ width: "100%", height: 260, borderRadius: 12, backgroundColor: "#eee" }}
          resizeMode="cover"
        />
      </View>

      {analysis && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>Analysis</Text>
          <Text>Main: {analysis.mainCategory ?? "-"}</Text>
          <Text>Sub: {analysis.subCategory ?? "-"}</Text>
          <Text>Tags: {analysis.detectedTags?.join(", ") ?? "-"}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            {(analysis.dominantColors ?? []).map((c) => (
              <View key={c} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c, borderWidth: 1, borderColor: "#ccc" }} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

