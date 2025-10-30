import React, { useState, useEffect, useFocusEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { productsService } from '../services/api';
import { Card, Button, LoadingScreen, ErrorAlert, EmptyState } from '../components';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const InventoryScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts(1, 100);
      setProducts(response.data.data || []);
      applyFilters(response.data.data || [], searchQuery, filterLowStock);
    } catch (err) {
      setError('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const applyFilters = (items: Product[], search: string, lowStockOnly: boolean) => {
    let filtered = items;

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (lowStockOnly) {
      filtered = filtered.filter((p) => p.stock < 10);
    }

    setFilteredProducts(filtered.sort((a, b) => a.stock - b.stock));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(products, text, filterLowStock);
  };

  const toggleLowStockFilter = () => {
    const newFilter = !filterLowStock;
    setFilterLowStock(newFilter);
    applyFilters(products, searchQuery, newFilter);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#ef4444';
    if (stock < 10) return '#f97316';
    return '#10b981';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Agotado';
    if (stock < 10) return 'Bajo';
    return 'Normal';
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AdjustStock', { product: item })}
    >
      <Card>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
          </View>
          <View style={styles.stockContainer}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: getStockColor(item.stock) },
              ]}
            >
              <Text style={styles.stockNumber}>{item.stock}</Text>
              <Text style={styles.stockLabel}>unidades</Text>
            </View>
            <Text
              style={[
                styles.stockStatus,
                { color: getStockColor(item.stock) },
              ]}
            >
              {getStockStatus(item.stock)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            filterLowStock && styles.filterBtnActive,
          ]}
          onPress={toggleLowStockFilter}
        >
          <Text
            style={[
              styles.filterBtnText,
              filterLowStock && styles.filterBtnTextActive,
            ]}
          >
            ⚠️ Stock Bajo
          </Text>
        </TouchableOpacity>
      </View>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Sin productos"
          message="No hay productos en el inventario"
          icon="📦"
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Button
        label="📊 Reportes de Stock"
        onPress={() => navigation.navigate('Reports')}
        variant="secondary"
        style={styles.reportsBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    fontSize: 14,
    color: '#1f2937',
  },
  filterBtn: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  filterBtnActive: {
    borderColor: '#f97316',
    backgroundColor: '#fed7aa',
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBtnTextActive: {
    color: '#92400e',
  },
  listContainer: {
    paddingBottom: 80,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  productCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
    marginTop: 4,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  stockNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  stockLabel: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
  },
  stockStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportsBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default InventoryScreen;
