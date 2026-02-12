import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '../../lib/logger';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { URLBar } from './URLBar';
import { ViewToggle } from './ViewToggle';
import { NavigationControls } from './NavigationControls';
import { FeedRenderer } from '../renderers/FeedRenderer';
import { ArticleRenderer } from '../renderers/ArticleRenderer';
import { ProductRenderer } from '../renderers/ProductRenderer';
import { SearchResultsRenderer } from '../renderers/SearchResultsRenderer';
import { RawRenderer } from '../renderers/RawRenderer';
import { SkeletonLoader } from '../renderers/SkeletonLoader';
import { INJECTION_BEFORE_LOAD, EXTRACTION_SCRIPT, NAVIGATION_LISTENER } from '../../lib/extraction/injected-scripts';
import { parseWebViewMessage, processExtraction } from '../../lib/extraction/content-processor';
import { transformContent } from '../../lib/ai/transform';
import { getAllPrompts, matchUrlToPrompt } from '../../lib/storage/prompts';
import { SitePrompt } from '../../types/prompts';
import { SchemaOutput, FeedSchema, ArticleSchema, ProductSchema, SearchResultsSchema } from '../../types/schemas';
import { ExtractedContent } from '../../types/ai';

type BrowserState = 'idle' | 'loading' | 'extracting' | 'transforming' | 'ready' | 'error' | 'web';

const DEFAULT_HOMEPAGE = 'https://news.google.com';

export function BrowserView() {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState(DEFAULT_HOMEPAGE);
  const [viewMode, setViewMode] = useState<'ai' | 'web'>('ai');
  const [browserState, setBrowserState] = useState<BrowserState>('loading');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [aiResult, setAiResult] = useState<SchemaOutput | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sitePrompts, setSitePrompts] = useState<SitePrompt[]>([]);
  const [activePromptName, setActivePromptName] = useState<string | undefined>();
  const extractionRef = useRef<string | null>(null);

  useEffect(() => {
    logger.info('BrowserView mounted, loading homepage', { url: DEFAULT_HOMEPAGE });
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const prompts = await getAllPrompts();
    setSitePrompts(prompts);
  };

  const navigate = useCallback((input: string) => {
    setUrl(input);
    setAiResult(null);
    setRawResponse(null);
    setErrorMessage(null);
    setBrowserState('loading');
    setViewMode('ai');
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    if (navState.url) {
      setUrl(navState.url);
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    if (browserState === 'loading' || browserState === 'extracting') {
      setBrowserState('extracting');
      // Inject extraction script after a short delay to let page JS run
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(EXTRACTION_SCRIPT);
      }, 1000);
    }
  }, [browserState]);

  const handleMessage = useCallback(async (event: { nativeEvent: { data: string } }) => {
    const message = parseWebViewMessage(event.nativeEvent.data);
    if (!message) return;

    if (message.type === 'navigation') {
      setUrl(message.url);
      setBrowserState('loading');
      setAiResult(null);
      return;
    }

    if (message.type === 'extraction_error') {
      setErrorMessage(`Extraction failed: ${message.error}`);
      setBrowserState('error');
      return;
    }

    if (message.type === 'extraction') {
      // Prevent duplicate extractions
      const extractionId = `${message.url}:${message.timestamp}`;
      if (extractionRef.current === extractionId) return;
      extractionRef.current = extractionId;

      setBrowserState('transforming');
      logger.info('Extraction complete, transforming', { url: message.url });

      const extracted = processExtraction(message);

      // Check for matching prompt
      const matched = matchUrlToPrompt(message.url, sitePrompts);
      setActivePromptName(matched?.name);

      try {
        const result = await transformContent(extracted, sitePrompts);

        if (result.success && result.data) {
          logger.info('AI transform success', { type: result.data.type });
          setAiResult(result.data);
          setRawResponse(null);
          setBrowserState('ready');
        } else if (result.raw) {
          logger.info('AI transform returned raw');
          setRawResponse(result.raw);
          setAiResult(null);
          setBrowserState('ready');
        } else {
          logger.error('AI transform failed', { error: result.error });
          setErrorMessage(result.error || 'Transformation failed');
          setBrowserState('error');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        logger.error('AI transform exception', { error: msg });
        setErrorMessage(msg);
        setBrowserState('error');
      }
    }
  }, [sitePrompts]);

  const handleToggle = useCallback((mode: 'ai' | 'web') => {
    setViewMode(mode);
  }, []);

  const renderAIView = () => {
    if (browserState === 'idle') {
      return (
        <View style={styles.emptyState}>
          <RawRenderer content="# AI Browser\n\nEnter a URL to get started. Content will be extracted and displayed natively." />
        </View>
      );
    }

    if (browserState === 'loading' || browserState === 'extracting' || browserState === 'transforming') {
      const skeletonType = aiResult?.type || 'generic';
      return <SkeletonLoader type={skeletonType as any} />;
    }

    if (browserState === 'error') {
      return (
        <RawRenderer
          content={`# Error\n\n${errorMessage || 'Something went wrong.'}\n\nTry switching to Web view or check your API key in Settings.`}
        />
      );
    }

    if (rawResponse) {
      return <RawRenderer content={rawResponse} />;
    }

    if (aiResult) {
      switch (aiResult.type) {
        case 'feed':
          return <FeedRenderer data={aiResult as FeedSchema} />;
        case 'article':
          return <ArticleRenderer data={aiResult as ArticleSchema} />;
        case 'product':
          return <ProductRenderer data={aiResult as ProductSchema} />;
        case 'search':
          return <SearchResultsRenderer data={aiResult as SearchResultsSchema} />;
        default:
          return <RawRenderer content={JSON.stringify(aiResult, null, 2)} />;
      }
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Content area */}
        <View style={styles.contentArea}>
          {/* WebView - always loaded, visibility toggled */}
          <View style={[styles.webViewContainer, viewMode !== 'web' && styles.hidden]}>
            {url ? (
              <WebView
                ref={webViewRef}
                source={{ uri: url }}
                style={styles.webView}
                injectedJavaScriptBeforeContentLoaded={INJECTION_BEFORE_LOAD + NAVIGATION_LISTENER}
                onNavigationStateChange={handleNavigationStateChange}
                onLoadEnd={handleLoadEnd}
                onMessage={handleMessage}
                allowsBackForwardNavigationGestures
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                sharedCookiesEnabled
              />
            ) : null}
          </View>

          {/* AI view */}
          <View style={[styles.aiViewContainer, viewMode !== 'ai' && styles.hidden]}>
            {renderAIView()}
          </View>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <NavigationControls
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onGoBack={() => webViewRef.current?.goBack()}
            onGoForward={() => webViewRef.current?.goForward()}
            onMenu={() => {}}
          />
          <URLBar
            url={url}
            isLoading={browserState === 'loading' || browserState === 'extracting' || browserState === 'transforming'}
            activePromptName={activePromptName}
            onSubmit={navigate}
            onStopLoading={() => webViewRef.current?.stopLoading()}
          />
          <ViewToggle
            mode={viewMode}
            onToggle={handleToggle}
            disabled={!url}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  webViewContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  aiViewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  hidden: {
    opacity: 0,
    zIndex: -1,
  },
  webView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    backgroundColor: '#fafafa',
    gap: 8,
  },
});
