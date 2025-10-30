import React, { useState, useEffect, useFocusEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { salesService } from '../services/api';
import { Card, Button, LoadingScreen, ErrorAlert, EmptyState } from '../components';

interface Sale {
  id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

const SalesScreen = ({ navigation }: any) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchSales();
    }, [])
  );

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesService.getSales(1, 50);
      setSales(response.data.data || []);
    } catch (err) {
      setError('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSales();
    setRefreshing(false);
  };

  const deleteSale = async (id: number) => {
    try {
      await salesService.deleteSale(id);
      setSales(sales.filter((s) => s.id !== id));
    } catch (err) {
      setError('Error al eliminar venta');
    }
  };

  const renderItem = ({ item }: { item: Sale }) => (
    <Card>
      <View style={styles.saleHeader}>
        <View style={styles.saleInfo}>
          <Text style={styles.customerName}>{item.customer_name}</Text>
          <Text style={styles.saleDetails}>
            ${item.total_amount} • {item.payment_method}
          </Text>
          <Text style={styles.saleDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteSale(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {sales.length === 0 ? (
        <EmptyState
          title="Sin ventas"
          message="Registra tu primera venta"
          icon="📦"
        />
      ) : (
        <FlatList
          data={sales}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Button
        label="➕ Nueva Venta"
        onPress={() => navigation.navigate('CreateSale')}
        style={styles.createBtn}
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
  listContainer: {
    paddingBottom: 80,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saleInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  saleDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saleDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '700',
  },
  createBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default SalesScreen;
