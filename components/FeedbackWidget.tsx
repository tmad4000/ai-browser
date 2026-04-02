import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';

const NOOS_API = 'https://globalbr.ai/api';
const PROJECT_ID = 'ai-browser';
const WIDGET_VERSION = '1.0.0';

type FeedbackType = 'issue' | 'bug' | 'feature' | 'annotation';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  content: string;
  url?: string;
  status?: string;
  createdAt?: string;
}

const TYPE_LABELS: Record<FeedbackType, string> = {
  issue: 'Issue',
  bug: 'Bug',
  feature: 'Feature',
  annotation: 'Note',
};

const TYPE_COLORS: Record<FeedbackType, string> = {
  issue: '#FF9500',
  bug: '#FF3B30',
  feature: '#007AFF',
  annotation: '#34C759',
};

export default function FeedbackWidget() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'submit' | 'list'>('submit');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(
        `${NOOS_API}/feedback?limit=30&domain=${encodeURIComponent(PROJECT_ID)}`
      );
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.issues || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (visible && tab === 'list') {
      fetchFeedback();
    }
  }, [visible, tab, fetchFeedback]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        url: `app://${PROJECT_ID}`,
        type: feedbackType,
        content: content.trim(),
        metadata: {
          platform: Platform.OS,
          widgetVersion: WIDGET_VERSION,
          projectId: PROJECT_ID,
        },
        visibility: 'public',
      };
      const res = await fetch(`${NOOS_API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setContent('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = () => {
    setVisible(true);
    setSubmitted(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>!</Text>
      </TouchableOpacity>

      {/* Feedback modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Feedback</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'submit' && styles.tabActive]}
              onPress={() => setTab('submit')}
            >
              <Text style={[styles.tabText, tab === 'submit' && styles.tabTextActive]}>
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'list' && styles.tabActive]}
              onPress={() => setTab('list')}
            >
              <Text style={[styles.tabText, tab === 'list' && styles.tabTextActive]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'submit' ? (
            <ScrollView
              style={styles.body}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Type selector */}
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeRow}>
                {(Object.keys(TYPE_LABELS) as FeedbackType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeChip,
                      feedbackType === t && { backgroundColor: TYPE_COLORS[t] },
                    ]}
                    onPress={() => setFeedbackType(t)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        feedbackType === t && styles.typeChipTextActive,
                      ]}
                    >
                      {TYPE_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content input */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textInput}
                value={content}
                onChangeText={setContent}
                placeholder="What's on your mind?"
                multiline
                textAlignVertical="top"
                returnKeyType="default"
              />

              {/* Submit */}
              {submitted ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>Thanks for your feedback!</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.submitButton, !content.trim() && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting || !content.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
              {loadingList ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#007AFF" />
              ) : feedbackList.length === 0 ? (
                <Text style={styles.emptyText}>No feedback yet</Text>
              ) : (
                feedbackList.map((item) => (
                  <View key={item.id} style={styles.feedbackCard}>
                    <View style={styles.feedbackHeader}>
                      <View
                        style={[
                          styles.feedbackTypeBadge,
                          { backgroundColor: TYPE_COLORS[item.type] || '#888' },
                        ]}
                      >
                        <Text style={styles.feedbackTypeBadgeText}>
                          {TYPE_LABELS[item.type] || item.type}
                        </Text>
                      </View>
                      {item.status && (
                        <Text style={styles.feedbackStatus}>{item.status}</Text>
                      )}
                      <Text style={styles.feedbackDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.feedbackContent}>{item.content}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
    paddingBottom: 12,
    backgroundColor: '#fafafa',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  closeButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 15,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  feedbackTypeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackStatus: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 'auto',
  },
  feedbackContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});
