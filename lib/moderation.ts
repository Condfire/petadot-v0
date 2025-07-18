import { createClient } from "@/lib/supabase/server"

export async function checkForBlockedKeywords(content: string) {
  const supabase = createClient()
  try {
    const { data: setting } = await supabase
      .from("moderation_settings")
      .select("setting_value")
      .eq("setting_key", "enable_keyword_moderation")
      .single()

    if (!setting || !setting.setting_value?.enabled) {
      return { blocked: false }
    }

    const { data: keywords } = await supabase
      .from("moderation_keywords")
      .select("keyword")
      .eq("is_active", true)

    if (!keywords || keywords.length === 0) {
      return { blocked: false }
    }

    const lowerContent = content.toLowerCase()
    for (const kw of keywords) {
      if (lowerContent.includes(kw.keyword.toLowerCase())) {
        return { blocked: true, keyword: kw.keyword }
      }
    }

    return { blocked: false }
  } catch (error) {
    console.error("Erro ao verificar palavras-chave:", error)
    return { blocked: false }
  }
}
