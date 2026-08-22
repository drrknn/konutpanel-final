// =============================================================================
// Konut Panel — yapılandırma
// Supabase > Project Settings > API'den alınır. Bu key tarayıcıda görünür,
// normaldir; veriyi RLS korur. service_role / secret key'i BURAYA ASLA koyma.
// =============================================================================
window.KONUT_PANEL_CONFIG = {
  SUPABASE_URL: "https://byuygverwpjskloqrele.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_f2gGJkl1dAdncuqLdIsfig_SaJoGG85",

  // Web push için VAPID public anahtarı.
  // Netlify'daki VAPID_PUBLIC_KEY ile AYNI değer olmalı.
  // Boş bırakılırsa push aboneliği kurulmaz, uygulama kapalıyken
  // bildirim gelmez (izin istemek tek başına yeterli değildir).
  VAPID_PUBLIC_KEY: "BHW_haoOqCZzXH92Jg1N9tkTrXzRMNJXKBjDjDNLnLJxf2i_WwyT2OTAnfJrm--fHtsNngtkcVmueQSAkfmE5hU",
};
