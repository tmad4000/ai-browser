import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { ProductSchema } from '../../types/schemas';

interface ProductRendererProps {
  data: ProductSchema;
}

export function ProductRenderer({ data }: ProductRendererProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {data.images.length > 0 && (
        <ScrollView horizontal pagingEnabled style={styles.imageCarousel} showsHorizontalScrollIndicator={false}>
          {data.images.map((img, i) => (
            <Image key={i} source={{ uri: img.url }} style={styles.productImage} resizeMode="contain" />
          ))}
        </ScrollView>
      )}

      <View style={styles.details}>
        {data.brand && <Text style={styles.brand}>{data.brand}</Text>}
        <Text style={styles.name}>{data.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {data.price.currency === 'USD' ? '$' : data.price.currency}{data.price.amount.toFixed(2)}
          </Text>
          {data.price.originalAmount && (
            <Text style={styles.originalPrice}>
              ${data.price.originalAmount.toFixed(2)}
            </Text>
          )}
          {data.price.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{data.price.discount}</Text>
            </View>
          )}
        </View>

        {data.rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>
              {'★'.repeat(Math.round(data.rating.score))}
              {'☆'.repeat(data.rating.maxScore - Math.round(data.rating.score))}
            </Text>
            <Text style={styles.ratingScore}>{data.rating.score.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({data.rating.count.toLocaleString()} ratings)</Text>
          </View>
        )}

        {data.availability && (
          <View style={[styles.availabilityBadge, data.availability === 'in_stock' ? styles.inStock : styles.outOfStock]}>
            <Text style={[styles.availabilityText, data.availability === 'in_stock' ? styles.inStockText : styles.outOfStockText]}>
              {data.availability === 'in_stock' ? 'In Stock' :
               data.availability === 'out_of_stock' ? 'Out of Stock' :
               data.availability === 'limited' ? 'Limited Stock' : 'Pre-order'}
            </Text>
          </View>
        )}

        {data.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this item</Text>
            <Text style={styles.description}>{data.description}</Text>
          </View>
        )}

        {data.specs && data.specs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {data.specs.map((spec, i) => (
              <View key={i} style={[styles.specRow, i % 2 === 0 && styles.specRowAlt]}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        )}

        {data.reviews && data.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {data.reviews.slice(0, 5).map((review, i) => (
              <View key={i} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <Text style={styles.reviewRating}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                {review.date && <Text style={styles.reviewDate}>{review.date}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  imageCarousel: { height: 300, backgroundColor: '#f9f9f9' },
  productImage: { width: 360, height: 300 },
  details: { padding: 16 },
  brand: { fontSize: 14, color: '#007185', marginBottom: 4 },
  name: { fontSize: 20, fontWeight: '600', color: '#111', lineHeight: 26, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '700', color: '#b12704' },
  originalPrice: { fontSize: 16, color: '#888', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#cc0c39', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  ratingStars: { fontSize: 16, color: '#de7921' },
  ratingScore: { fontSize: 14, fontWeight: '600', color: '#de7921' },
  ratingCount: { fontSize: 14, color: '#007185' },
  availabilityBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 16 },
  inStock: { backgroundColor: '#e8f5e9' },
  outOfStock: { backgroundColor: '#ffebee' },
  availabilityText: { fontSize: 14, fontWeight: '600' },
  inStockText: { color: '#2e7d32' },
  outOfStockText: { color: '#c62828' },
  section: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 23, color: '#333' },
  specRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8 },
  specRowAlt: { backgroundColor: '#f8f8f8' },
  specLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#555' },
  specValue: { flex: 1, fontSize: 14, color: '#333' },
  review: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewAuthor: { fontSize: 14, fontWeight: '600', color: '#333' },
  reviewRating: { fontSize: 14, color: '#de7921' },
  reviewText: { fontSize: 14, lineHeight: 20, color: '#444' },
  reviewDate: { fontSize: 12, color: '#888', marginTop: 4 },
});
