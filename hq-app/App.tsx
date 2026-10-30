import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { useKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useNetInfo } from '@react-native-community/netinfo';

// The live Eagle Bed HQ command center. Updating the artifact updates the app; no new build needed.
const HQ_URL = 'https://claude.ai/artifact/H8ECqvxQbUQSABuMUK1iki';

// Hosts that stay inside the app: Claude, its sign-in, and the sandbox the HQ page runs in.
const INSIDE = [/(^|\.)claude\.ai$/, /(^|\.)anthropic\.com$/, /(^|\.)claudeusercontent\.com$/, /(^|\.)apple\.com$/];

const C = { bg: '#04090B', panel: '#091417', line: 'rgba(61,245,160,0.25)', green: '#3DF5A0', muted: '#74A08B', red: '#FF5C7A' };
const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

SplashScreen.preventAutoHideAsync().catch(() => {});

function hostOf(url: string): string {
  const m = /^https?:\/\/([^/:?#]+)/i.exec(url);
  return m ? m[1].toLowerCase() : '';
}

function Terminal({ title, lines, action, onAction }: { title: string; lines: string[]; action: string; onAction: () => void }) {
  return (
    <View style={s.center}>
      <View style={s.term}>
        <Text style={s.termBar}>● ● ●  eaglebed://hq</Text>
        <Text style={[s.termText, { color: C.red }]}>{'> ' + title}</Text>
        {lines.map((l) => (
          <Text key={l} style={s.termText}>{'  ' + l}</Text>
        ))}
        <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => [s.btn, pressed && { opacity: 0.7 }]}>
          <Text style={s.btnText}>{action}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HQ() {
  // Agents only work while HQ is open, so keep the screen on while the app is in front.
  useKeepAwake();
  const web = useRef<WebView>(null);
  const net = useNetInfo();
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [key, setKey] = useState(0);

  const offline = net.isConnected === false;

  const reload = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFailed(null);
    setKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && web.current) {
        web.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const route = useCallback((req: ShouldStartLoadRequest) => {
    if (!req.isTopFrame) return true;
    if (!/^https?:/i.test(req.url)) return true;
    const host = hostOf(req.url);
    if (INSIDE.some((re) => re.test(host))) return true;
    // Shopify admin, product pages, Google and other outside links open in the in-app browser.
    WebBrowser.openBrowserAsync(req.url).catch(() => {});
    return false;
  }, []);

  if (offline) {
    return (
      <Terminal
        title="NO CONNECTION"
        lines={['Eagle Bed HQ needs the internet to reach', 'your agents, Shopify and Google.', 'Turn on Wi-Fi or mobile data, then retry.']}
        action="Retry"
        onAction={reload}
      />
    );
  }

  if (failed) {
    return (
      <Terminal
        title="LINK FAILED"
        lines={[failed, 'Check your connection and that you are', 'signed in to Claude, then retry.']}
        action="Reload HQ"
        onAction={reload}
      />
    );
  }

  return (
    <View style={s.fill}>
      {progress < 1 && <View style={[s.bar, { width: `${Math.max(8, progress * 100)}%` }]} />}
      <WebView
        key={key}
        ref={web}
        source={{ uri: HQ_URL }}
        style={s.web}
        containerStyle={s.web}
        originWhitelist={['https://*', 'http://*']}
        onShouldStartLoadWithRequest={route}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        domStorageEnabled
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        applicationNameForUserAgent="EagleBedHQ/1.0"
        onLoadProgress={(e) => setProgress(e.nativeEvent.progress)}
        onLoadEnd={() => {
          SplashScreen.hideAsync().catch(() => {});
        }}
        onNavigationStateChange={(n) => setCanGoBack(n.canGoBack)}
        onError={(e) => setFailed(e.nativeEvent.description || 'The page did not load.')}
        onHttpError={(e) => {
          if (e.nativeEvent.statusCode >= 500) setFailed(`Claude answered with error ${e.nativeEvent.statusCode}.`);
        }}
        onContentProcessDidTerminate={() => {
          web.current?.reload();
        }}
        onRenderProcessGone={() => {
          web.current?.reload();
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.fill} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <HQ />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  web: { flex: 1, backgroundColor: C.bg },
  bar: { position: 'absolute', top: 0, left: 0, height: 2, backgroundColor: C.green, zIndex: 2 },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', padding: 20 },
  term: { borderWidth: 1, borderColor: C.line, borderRadius: 6, backgroundColor: C.panel, padding: 16, gap: 6 },
  termBar: { fontFamily: MONO, color: C.muted, fontSize: 12, letterSpacing: 1.5, marginBottom: 8 },
  termText: { fontFamily: MONO, color: C.green, fontSize: 14, lineHeight: 21 },
  btn: { marginTop: 14, borderWidth: 1, borderColor: C.green, borderRadius: 4, paddingVertical: 12, alignItems: 'center' },
  btnText: { fontFamily: MONO, color: C.green, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
});
