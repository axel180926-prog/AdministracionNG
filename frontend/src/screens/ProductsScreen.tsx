import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { productsService } from '../services/api';
import { Card, Button, Input, LoadingScreen, EmptyState } from '../components';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

const ProductsScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productsService.getProducts(1, 10, searchTerm);
      setProducts(response.data.data);
    } catch (err: any) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchProducts(text);
  };

  const handleDelete = async (id: number) => {
    try {
      await productsService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
        <View>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={item.stock < 10 ? styles.lowStock : styles.stock}>
            Stock: {item.stock}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="Edit" variant="secondary" onPress={() => {}} style={styles.btn} />
        <Button label="Delete" variant="danger" onPress={() => handleDelete(item.id)} style={styles.btn} />
      </View>
    </Card>
  );

  if (loading && !products.length) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <Input placeholder="Search..." value={search} onChangeText={handleSearch} />
      <Button label="Add Product" onPress={() => {}} style={styles.createBtn} />
      {!products.length ? (
        <EmptyState title="No products" message="Create one to start!" icon="📦" />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts()} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  category: { fontSize: 12, color: '#3b82f6' },
  desc: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  stock: { fontSize: 12, color: '#6b7280' },
  lowStock: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btn: { flex: 1 },
  createBtn: { marginHorizontal: 16 },
});

export default ProductsScreen;
