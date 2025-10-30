import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { salesService, productsService } from '../services/api';
import { Card, Button, Input, LoadingScreen, ErrorAlert } from '../components';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface SaleItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const CreateSaleScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts(1, 100);
      setProducts(response.data.data.filter((p: Product) => p.stock > 0));
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Selecciona producto y cantidad');
      return;
    }

    const qty = parseInt(quantity);
    if (qty > selectedProduct.stock) {
      Alert.alert('Error', `Stock disponible: ${selectedProduct.stock}`);
      return;
    }

    const subtotal = qty * selectedProduct.price;
    const newItem: SaleItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: qty,
      unit_price: selectedProduct.price,
      subtotal,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setQuantity('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Ingresa nombre del cliente');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const total = parseFloat(calculateTotal());

      await salesService.createSale({
        customer_name: customerName,
        customer_phone: customerPhone,
        items,
        payment_method: paymentMethod,
        notes: '',
      });

      Alert.alert('Éxito', 'Venta registrada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear venta');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: SaleItem; index: number }) => (
    <Card>
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity}x ${item.unit_price} = ${item.subtotal.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => removeItem(index)}>
          <Text style={styles.removeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Cliente</Text>
        <Input
          placeholder="Nombre del cliente"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <Input
          placeholder="Teléfono (opcional)"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Agregar Productos</Text>

        <View style={styles.productSelector}>
          <TouchableOpacity
            style={styles.productDisplay}
            onPress={() => {
              Alert.alert(
                'Seleccionar Producto',
                'Elige un producto',
                products
                  .filter((p) => p.stock > 0)
                  .map((p) => ({
                    text: `${p.name} (Stock: ${p.stock})`,
                    onPress: () => setSelectedProduct(p),
                  }))
                  .concat([{ text: 'Cancelar', onPress: () => {} }])
              );
            }}
          >
            <Text style={styles.productText}>
              {selectedProduct ? selectedProduct.name : 'Selecciona producto'}
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Cantidad"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <Button
          label="➕ Agregar"
          onPress={addItem}
          variant="secondary"
          style={styles.addBtn}
        />
      </View>

      {items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Items ({items.length})</Text>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            scrollEnabled={false}
          />

          <Card style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Método de Pago</Text>
        {['cash', 'card', 'transfer'].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              paymentMethod === method && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={styles.paymentText}>
              {method === 'cash' && '💵 Efectivo'}
              {method === 'card' && '💳 Tarjeta'}
              {method === 'transfer' && '🏦 Transferencia'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        label="✅ Registrar Venta"
        onPress={handleSubmit}
        loading={submitting}
        disabled={items.length === 0}
        style={styles.submitBtn}
      />

      <Button
        label="❌ Cancelar"
        onPress={() => navigation.goBack()}
        variant="secondary"
        style={styles.cancelBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  productSelector: {
    marginVertical: 8,
  },
  productDisplay: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  productText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  addBtn: {
    marginTop: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  removeBtn: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: '700',
  },
  totalCard: {
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    backgroundColor: 'white',
  },
  paymentSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  submitBtn: {
    marginBottom: 8,
  },
  cancelBtn: {
    marginBottom: 32,
  },
});

export default CreateSaleScreen;
