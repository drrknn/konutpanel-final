package android.support.customtabs.trusted;

/**
 * AndroidManifest.xml, launcher aktivitesini eski destek kutuphanesi paket
 * adiyla (android.support.customtabs.trusted.LauncherActivity) tanimlar.
 * Bu koprü sinifi, androidbrowserhelper kutuphanesindeki gercek TWA
 * launcher aktivitesini o ad altinda gorunur kilar.
 *
 * Bu dosya olmadan uygulama acilirken ClassNotFoundException ile coker.
 */
public class LauncherActivity
        extends com.google.androidbrowserhelper.trusted.LauncherActivity {
}
