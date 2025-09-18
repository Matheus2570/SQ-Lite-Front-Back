import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity
} from 'react-native';

const API_URL = 'http://10.136.38.166:3000/clientes'; // laura IP front 

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [idBusca, setIdBusca] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [buscaErro, setBuscaErro] = useState('');

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

  // Refresh (puxar para baixo)
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClientes();
    setRefreshing(false);
  };

  // GET por ID
  const fetchClienteById = async () => {
    const trimmed = idBusca.trim();
    setClienteEncontrado(null);
    setBuscaErro('');
    if (!trimmed) {
      setBuscaErro('Informe um ID para buscar.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${trimmed}`);
      if (!res.ok) {
        setBuscaErro('Cliente não encontrado.');
        return;
      }
      const data = await res.json();
      setClienteEncontrado(data);
    } catch (err) {
      setBuscaErro('Erro ao buscar cliente.');
    }
  };

  // ADD cliente
  const addCliente = async () => {
    if (!nome.trim() || !cpf.trim()) {
      Alert.alert('Erro', 'Nome e CPF são obrigatórios');
      return;
    }
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, telefone })
      });
      limparFormulario();
      fetchClientes();
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar cliente');
    }
  };

  // UPDATE cliente
  const updateCliente = async () => {
    if (!idEditar || !nome.trim() || !cpf.trim()) {
      Alert.alert('Erro', 'Selecione um cliente e preencha Nome/CPF');
      return;
    }
    try {
      await fetch(`${API_URL}/${idEditar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, email, telefone })
      });
      setIdEditar(null);
      limparFormulario();
      fetchClientes();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar cliente');
    }
  };

  // DELETE cliente
  const deleteCliente = (id) => {
    Alert.alert('Confirmar exclusão', 'Deseja realmente excluir este cliente?', [
      { text: 'Não' },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (clienteEncontrado && clienteEncontrado.id === id) {
              setClienteEncontrado(null);
              setIdBusca('');
            }
            if (idEditar === id) {
              setIdEditar(null);
              limparFormulario();
            }
            fetchClientes();
          } catch {
            Alert.alert('Erro', 'Não foi possível deletar cliente');
          }
        }
      }
    ]);
  };

  const limparFormulario = () => {
    setNome('');
    setCpf('');
    setEmail('');
    setTelefone('');
  };

  const startEdit = (item) => {
    setIdEditar(item.id);
    setNome(item.nome ?? '');
    setCpf(item.cpf ?? '');
    setEmail(item.email ?? '');
    setTelefone(item.telefone ?? '');
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardRow}>
      <View style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.pequeno}>
       Cpf: {item.cpf}{"\n"}
  Email: {item.email ?? "-"}{"\n"}
  Telefone: {item.telefone ?? "-"}{"\n"}
  ID: {item.id ?? "-"}
        </Text>
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.buttonSmall} onPress={() => startEdit(item)}>
          <Text style={styles.buttonSmallText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonSmall, styles.buttonDelete]}
          onPress={() => deleteCliente(item.id)}
        >
          <Text style={styles.buttonSmallText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Lista de Clientes</Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        style={styles.flatlist}
      />

      {/* Buscar cliente por ID */}
      <TextInput
        style={styles.input}
        placeholder="Buscar cliente por ID"
        value={idBusca}
        onChangeText={(t) => {
          setIdBusca(t);
          setBuscaErro('');
        }}
        keyboardType="numeric"
      />
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.button} onPress={fetchClienteById}>
          <Text style={styles.buttonText}>Buscar por ID</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonClear]}
          onPress={() => {
            setIdBusca('');
            setClienteEncontrado(null);
            setBuscaErro('');
          }}
        >
          <Text style={styles.buttonText}>Limpar</Text>
        </TouchableOpacity>
      </View>
      {buscaErro ? <Text style={styles.erro}>{buscaErro}</Text> : null}

      {clienteEncontrado && (
        <View style={styles.card}>
          <Text style={styles.nome}>{clienteEncontrado.nome}</Text>
          <Text style={styles.pequeno}>
            {clienteEncontrado.cpf} • {clienteEncontrado.email ?? '-'} •{' '}
            {clienteEncontrado.telefone ?? '-'}
          </Text>
          <View style={[styles.buttonsRow, { marginTop: 8 }]}>
            <TouchableOpacity style={styles.buttonSmall} onPress={() => startEdit(clienteEncontrado)}>
              <Text style={styles.buttonSmallText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonSmall, styles.buttonDelete]}
              onPress={() => deleteCliente(clienteEncontrado.id)}
            >
              <Text style={styles.buttonSmallText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Formulário */}
      <Text style={[styles.subtitulo, { marginTop: 12 }]}>
        {idEditar ? '✏️ Editar Cliente' : '➕ Adicionar Cliente'}
      </Text>
      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
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

      <View style={styles.actionRow}>
        {idEditar ? (
          <>
            <TouchableOpacity style={styles.button} onPress={updateCliente}>
              <Text style={styles.buttonText}>Atualizar Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClear]}
              onPress={() => {
                setIdEditar(null);
                limparFormulario();
              }}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={addCliente}>
            <Text style={styles.buttonText}>Adicionar Cliente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  flatlist: { flexGrow: 0, marginBottom: 12 },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  cardContent: { flex: 1, paddingRight: 8 },
  card: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  nome: { fontSize: 16, fontWeight: '600' },
  pequeno: { fontSize: 12, color: '#666', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 6, borderRadius: 6 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  button: {
    marginBottom: 13,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1976D2',
    borderRadius: 6,
    marginRight: 8
  },
  buttonClear: {
    backgroundColor: '#777'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonSmall: {
marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#1976D2',
    marginLeft: 6
  },
  buttonSmallText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  buttonDelete: { backgroundColor: '#D32F2F' },
  subtitulo: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  erro: { color: '#D32F2F', marginTop: 6 }
});
