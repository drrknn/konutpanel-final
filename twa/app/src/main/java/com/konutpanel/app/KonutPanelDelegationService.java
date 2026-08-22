package com.konutpanel.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;

import com.google.androidbrowserhelper.trusted.DelegationService;

/**
 * Konut Panel — özel bildirim kanalı.
 *
 * NEDEN GEREKLİ
 * TWA'da web push bildirimleri Chrome tarafından uygulamaya devredilir.
 * Devredilen bildirim, varsayılan olarak sistemin genel bildirim sesini
 * kullanır. Kullanıcı bildirimin Konut Panel'den geldiğini sesten
 * anlayamaz.
 *
 * NE YAPAR
 * Kendi bildirim kanalımızı özel sesle oluşturur ve gelen her bildirimi
 * o kanala yönlendirir. Ses dosyası: res/raw/konut_panel_bildirim.ogg
 *
 * ÖNEMLİ KISIT
 * Android, bir bildirim kanalının sesini kanal OLUŞTURULDUKTAN SONRA
 * değiştirmeye izin vermez. Sesi değiştirmek gerekirse KANAL_ID'yi
 * artır (v1 -> v2); aksi halde kullanıcılarda eski ses çalmaya devam eder.
 */
public class KonutPanelDelegationService extends DelegationService {

    private static final String KANAL_ID  = "konutpanel_bildirim_v1";
    private static final String KANAL_ADI = "Konut Panel Bildirimleri";

    @Override
    public void onCreate() {
        super.onCreate();
        kanaliOlustur();
    }

    private void kanaliOlustur() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(KANAL_ID) != null) return;

        NotificationChannel kanal = new NotificationChannel(
                KANAL_ID, KANAL_ADI, NotificationManager.IMPORTANCE_HIGH);
        kanal.setDescription("Aidat, duyuru, arıza ve acil durum bildirimleri");

        Uri ses = Uri.parse("android.resource://" + getPackageName()
                + "/" + R.raw.konut_panel_bildirim);

        AudioAttributes nitelik = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();

        kanal.setSound(ses, nitelik);
        kanal.enableVibration(true);
        kanal.setVibrationPattern(new long[]{ 220, 90, 220, 90, 380 });
        kanal.enableLights(true);
        kanal.setLightColor(0xFF8E93FF);
        kanal.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        kanal.setShowBadge(true);

        nm.createNotificationChannel(kanal);
    }

    /**
     * Chrome'dan devredilen bildirimi kendi kanalımıza taşır.
     *
     * NEDEN super ÇAĞRILMIYOR
     * Kütüphanenin kendi uygulaması, kanal ADINDAN bir kanal kimliği
     * türetip bildirimi oraya gönderiyor — yani bizim atadığımız kanal
     * kimliğini eziyor. Sonuçta aynı isimde ikinci bir kanal oluşuyor ve
     * bildirim sistem sesiyle çalıyor. Bu yüzden bildirimi doğrudan
     * kendimiz gönderiyoruz.
     */
    @Override
    public boolean onNotifyNotificationWithChannel(String platformTag,
                                                   int platformId,
                                                   Notification bildirim,
                                                   String kanalAdi) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) {
            return super.onNotifyNotificationWithChannel(
                    platformTag, platformId, bildirim, kanalAdi);
        }

        if (!NotificationManagerCompat.from(this).areNotificationsEnabled()) {
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            kanaliOlustur();
            try {
                Notification yeniden = Notification.Builder
                        .recoverBuilder(this, bildirim)
                        .setChannelId(KANAL_ID)
                        .build();
                nm.notify(platformTag, platformId, yeniden);
                return true;
            } catch (Exception e) {
                // recoverBuilder bazı cihazlarda başarısız olabilir —
                // bildirimi kaybetmemek için kütüphaneye geri dönülür.
            }
        }
        return super.onNotifyNotificationWithChannel(
                platformTag, platformId, bildirim, kanalAdi);
    }

    /**
     * Kütüphane, bildirimlerin açık olup olmadığını kanal adından
     * türettiği kimlikle sorar. Bizim kanalımız farklı bir kimlik
     * taşıdığı için o kontrol "kapalı" döner ve bildirim hiç gelmez.
     */
    @Override
    public boolean onAreNotificationsEnabled(String kanalAdi) {
        if (!NotificationManagerCompat.from(this).areNotificationsEnabled()) return false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            kanaliOlustur();
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm == null) return true;
            NotificationChannel k = nm.getNotificationChannel(KANAL_ID);
            return k == null || k.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }
        return true;
    }
}
