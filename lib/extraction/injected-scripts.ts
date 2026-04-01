/**
 * Script injected before page content loads.
 * Sets up the extraction harness.
 */
export const INJECTION_BEFORE_LOAD = `
(function() {
  // Flag to prevent double-extraction
  window.__AI_BROWSER_EXTRACTED = false;

  // Override to capture JSON-LD
  window.__AI_BROWSER_JSON_LD = [];

  // Observe DOM for JSON-LD scripts
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'SCRIPT' && node.type === 'application/ld+json') {
          try {
            window.__AI_BROWSER_JSON_LD.push(JSON.parse(node.textContent));
          } catch(e) {}
        }
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  true; // Required for injectedJavaScriptBeforeContentLoaded
})();
`;

/**
 * Main extraction script run after page loads.
 * Extracts content, metadata, and feed items.
 */
export const EXTRACTION_SCRIPT = `
(function() {
  if (window.__AI_BROWSER_EXTRACTED) return;
  window.__AI_BROWSER_EXTRACTED = true;

  function getMeta() {
    const meta = {};
    document.querySelectorAll('meta').forEach(function(el) {
      const name = el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('itemprop');
      const content = el.getAttribute('content');
      if (name && content) meta[name] = content;
    });
    return meta;
  }

  function getJsonLd() {
    const results = [...(window.__AI_BROWSER_JSON_LD || [])];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(el) {
      try {
        const data = JSON.parse(el.textContent);
        // Avoid duplicates
        if (!results.some(r => JSON.stringify(r) === JSON.stringify(data))) {
          results.push(data);
        }
      } catch(e) {}
    });
    return results;
  }

  function classifyPage(url, meta) {
    const hostname = new URL(url).hostname;

    // Feed-like sites
    const feedHosts = ['twitter.com', 'x.com', 'reddit.com', 'news.ycombinator.com', 'facebook.com', 'instagram.com', 'threads.net', 'mastodon.social', 'bsky.app'];
    if (feedHosts.some(h => hostname.includes(h))) return 'feed';

    // Search engines
    const searchHosts = ['google.com', 'bing.com', 'duckduckgo.com', 'search.yahoo.com'];
    const isKnownSearchHost = searchHosts.some(function(h) { return hostname.includes(h); });
    const looksLikeSearchUrl = url.includes('search') || url.includes('?q=');
    if (isKnownSearchHost && looksLikeSearchUrl) return 'search';

    // Shopping
    const shopHosts = ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com'];
    if (shopHosts.some(h => hostname.includes(h))) return 'product';

    // Article detection
    if (document.querySelector('article') || meta['og:type'] === 'article' || document.querySelector('[itemprop="articleBody"]')) return 'article';

    return 'unknown';
  }

  function extractFeedItems() {
    const items = [];

    // Twitter/X
    const tweets = document.querySelectorAll('[data-testid="tweet"], [data-testid="tweetText"]');
    if (tweets.length > 0) {
      tweets.forEach(function(tweet, i) {
        items.push(tweet.innerText || tweet.textContent);
      });
      return items;
    }

    // Reddit
    const posts = document.querySelectorAll('[data-testid="post-container"], .Post, shreddit-post');
    if (posts.length > 0) {
      posts.forEach(function(post) {
        items.push(post.innerText || post.textContent);
      });
      return items;
    }

    // HN
    const hnItems = document.querySelectorAll('.athing');
    if (hnItems.length > 0) {
      hnItems.forEach(function(item) {
        const next = item.nextElementSibling;
        const text = item.innerText + (next ? '\\n' + next.innerText : '');
        items.push(text);
      });
      return items;
    }

    // Generic article/role-based
    const articles = document.querySelectorAll('article, [role="article"], [role="listitem"]');
    articles.forEach(function(article) {
      items.push(article.innerText || article.textContent);
    });

    return items;
  }

  function extractMainContent() {
    // Try to get main content area
    const selectors = ['main', 'article', '[role="main"]', '#content', '.content', '#main-content', '.main-content'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText && el.innerText.length > 200) {
        return el.innerText;
      }
    }
    // Fallback: body text
    return document.body.innerText || document.body.textContent || '';
  }

  try {
    const url = window.location.href;
    const meta = getMeta();
    const contentType = classifyPage(url, meta);
    const feedItems = contentType === 'feed' ? extractFeedItems() : [];
    const mainContent = extractMainContent();
    const jsonLd = getJsonLd();

    const result = {
      type: 'extraction',
      url: url,
      title: document.title,
      content: mainContent.substring(0, 100000), // Limit to ~100K chars
      contentType: contentType,
      meta: meta,
      jsonLd: jsonLd.length > 0 ? jsonLd : undefined,
      feedItems: feedItems.length > 0 ? feedItems.map(function(item) { return item.substring(0, 5000); }) : undefined,
      timestamp: Date.now()
    };

    window.ReactNativeWebView.postMessage(JSON.stringify(result));
  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'extraction_error',
      error: e.message,
      url: window.location.href
    }));
  }

  true;
})();
`;

/**
 * Navigation event listener script.
 * Detects URL changes in SPAs.
 */
export const NAVIGATION_LISTENER = `
(function() {
  let lastUrl = window.location.href;

  // Listen for history changes (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    checkUrlChange();
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    checkUrlChange();
  };

  window.addEventListener('popstate', checkUrlChange);

  function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      window.__AI_BROWSER_EXTRACTED = false;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'navigation',
        url: currentUrl,
        title: document.title
      }));
    }
  }

  true;
})();
`;
