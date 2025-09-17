import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, Alert } from 'react-native';

const API_URL = 'http://10.136.38.150:3000/clientes'; // ✅ porta corrigida

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [idBusca, setIdBusca] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [idEditar, setIdEditar] = useState(null);

  // GET ALL
  const fetchClientes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar clientes');
    }
  };

  // GET por ID
  const fetchClienteById = async () => {
    if (!idBusca) return;
    try {
      const res = await fetch(`${API_URL}/${idBusca}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      Alert.alert('Cliente encontrado', JSON.stringify(data));
    } catch {
      Alert.alert('Erro', 'Cliente não encontrado');
    }
  };

  // ADD cliente
  const addCliente = async () => {
    if (!nome || !cpf) {
      Alert.alert('Erro', 'Nome e CPF são obrigatórios');
      return;
    }
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, telefone })
      });
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      fetchClientes();
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar cliente');
    }
  };

  // UPDATE cliente
  const updateCliente = async () => {
    if (!idEditar || !nome || !cpf) {
      Alert.alert('Erro', 'Nome e CPF são obrigatórios');
      return;
    }
    try {
      await fetch(`${API_URL}/${idEditar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, telefone })
      });
      setIdEditar(null);
      setNome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      fetchClientes();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar cliente');
    }
  };

  // DELETE cliente
  const deleteCliente = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchClientes();
    } catch {
      Alert.alert('Erro', 'Não foi possível deletar cliente');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Lista de Clientes</Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.nome} - {item.cpf} - {item.email} - {item.telefone}</Text>
            <Button title="Editar" onPress={() => {
              setIdEditar(item.id);
              setNome(item.nome);
              setCpf(item.cpf);
              setEmail(item.email);
              setTelefone(item.telefone);
            }} />
            <Button title="Excluir" color="red" onPress={() => deleteCliente(item.id)} />
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Buscar cliente por ID"
        value={idBusca}
        onChangeText={setIdBusca}
        keyboardType="numeric"
      />
      <Button title="Buscar" onPress={fetchClienteById} />

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />

      {idEditar ? (
        <Button title="Atualizar Cliente" onPress={updateCliente} />
      ) : (
        <Button title="Adicionar Cliente" onPress={addCliente} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 5, borderRadius: 5 },
  card: { padding: 10, marginVertical: 5, borderWidth: 1, borderRadius: 5 }
});
