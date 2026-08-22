import { Resend } from 'resend';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const {
      siteAdi = 'Site Yönetimi',
      muhasebeciAd = 'Mali Müşavir',
      muhasebeciEposta,
      baslangic = '',
      bitis = '',
      toplamTutar = 0,
      belgeSayisi = 0,
      dokumListesi = [],
      zipBase64,
      zipFileName = 'Fis_Faturalar.zip',
    } = body;

    if (!muhasebeciEposta || !muhasebeciEposta.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Geçerli bir muhasebeci e-posta adresi belirtiniz.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      return new Response(
        JSON.stringify({
          success: false,
          needsConfig: true,
          error: 'E-posta servisi anahtarı (RESEND_API_KEY) tanımlanmamış.',
          message: 'Otomatik e-posta göndermek için Netlify ayarlarına RESEND_API_KEY anahtarınızı ekleyin.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formattedTotal = Number(toplamTutar).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const rowsHtml = Array.isArray(dokumListesi) && dokumListesi.length > 0
      ? dokumListesi.map((b, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; font-size: 13px; color: #6b7280; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #111827; font-weight: 500;">${b.firma || b.baslik || 'Gider'}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #4b5563;">${b.kategori || '-'}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #6b7280;">${b.tarih || '-'}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #6b7280;">${b.fis_no || '-'}</td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #dc2626; text-align: right;">-${Number(b.tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
        </tr>
      `).join('')
      : '';

    const subject = `${siteAdi} — ${baslangic} - ${bitis} Dönemi Fiş ve Fatura ZIP Arşivi`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: #1e3a8a; padding: 24px 28px; color: #ffffff;">
          <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Konut Panel — Dönem Fiş & Fatura Arşivi</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">${siteAdi} Yönetimi Muhasebe Bildirimi</p>
        </div>

        <div style="padding: 28px;">
          <p style="margin-top: 0; font-size: 15px; line-height: 1.6; color: #374151;">
            Sayın <strong>${muhasebeciAd}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            <strong>${siteAdi}</strong> yönetimine ait <strong>${baslangic} — ${bitis}</strong> dönemine ait toplam <strong>${belgeSayisi} adet</strong> fiş, fatura ve gider belgesi dosyası ekteki <strong>.ZIP</strong> arşivi olarak bilginize sunulmuştur.
          </p>

          <!-- Özet Kartı -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Dönem Aralığı:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">${baslangic} — ${bitis}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Belge Sayısı:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">${belgeSayisi} Belge (PDF)</td>
              </tr>
              <tr style="border-top: 1px dashed #cbd5e1;">
                <td style="padding: 10px 0 4px 0; font-size: 15px; font-weight: 600; color: #0f172a;">Toplam Gider Tutarı:</td>
                <td style="padding: 10px 0 4px 0; text-align: right; font-size: 18px; font-weight: 700; color: #dc2626;">-${formattedTotal} ₺</td>
              </tr>
            </table>
          </div>

          <!-- Döküm Tablosu -->
          ${rowsHtml ? `
            <h3 style="font-size: 15px; font-weight: 600; color: #111827; margin: 24px 0 12px 0;">Dönem Gider Dökümü</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563; text-align: center; width: 30px;">#</th>
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Firma / Açıklama</th>
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Kategori</th>
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Tarih</th>
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563;">Fiş No</th>
                  <th style="padding: 8px; font-size: 12px; font-weight: 600; color: #4b5563; text-align: right;">Tutar</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          ` : ''}

          <!-- Ek Bilgisi -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin: 20px 0; display: flex; align-items: center;">
            <div style="font-size: 24px; margin-right: 12px;">📦</div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #1e40af;">ZIP Arşivi Ektedir</div>
              <div style="font-size: 12px; color: #3b82f6;">Tüm fiş ve faturaların orijinal PDF dosyaları e-postanın ekinde yer alan <strong>${zipFileName}</strong> dosyasındadır.</div>
            </div>
          </div>

          <p style="font-size: 13px; color: #6b7280; margin-top: 24px; line-height: 1.5;">
            Bu e-posta <strong>Konut Panel</strong> Site ve Bina Yönetim Sistemi üzerinden otomatik olarak iletilmiştir.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 16px 28px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Konut Panel — Akıllı Site ve Bina Yönetim Platformu
        </div>
      </div>
    `;

    // E-posta gönderimi — Resend API
    // konutpanel.com alan adı Resend üzerinde doğrulanmıştır.
    const resend = new Resend(resendKey);
    const fromAddress = process.env.RESEND_FROM || `"${siteAdi} (Konut Panel)" <info@konutpanel.com>`;

    const attachments = zipBase64
      ? [{ filename: zipFileName, content: Buffer.from(zipBase64, 'base64') }]
      : [];

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [muhasebeciEposta],
      subject,
      html: htmlContent,
      attachments,
    });

    if (error) {
      throw new Error(error.message || 'Resend ile e-posta gönderilemedi.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: 'Resend',
        message: `ZIP arşivi ${muhasebeciEposta} adresine başarıyla iletildi.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Mail gönderim hatası:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'E-posta gönderilirken hata oluştu: ' + (err.message || err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
