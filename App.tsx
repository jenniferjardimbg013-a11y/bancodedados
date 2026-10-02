import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';

import * as SQLite from 'expo-sqlite';

interface Tarefa {
  id: number;
  nome: string;
}

export default function App() {
  const [banco, setBanco] = useState<SQLite.SQLiteDatabase | null>(null);
  const [tarefa, setTarefa] = useState('');
  const [listaTarefa, setListaTarefa] = useState<Tarefa[]>([]);

  // Iniciar banco de dados
  useEffect(() => {
    async function iniciarBanco() {
      try {
        const db = await SQLite.openDatabaseAsync('tarefas.db');

        setBanco(db);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY NOT NULL,
            nome TEXT NOT NULL
          );
        `);

        const tarefas = await db.getAllAsync<Tarefa>(
          'SELECT id, nome FROM tarefas ORDER BY id ASC'
        );

        setListaTarefa(tarefas);
      } catch (error) {
        console.error('Erro ao iniciar banco:', error);
      }
    }

    iniciarBanco();
  }, []);

  // Atualizar lista de tarefas
  async function atualizarLista(db: SQLite.SQLiteDatabase) {
    try {
      const resultado = await db.getAllAsync<Tarefa>(
        'SELECT id, nome FROM tarefas ORDER BY id ASC'
      );

      setListaTarefa(resultado);
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
    }
  }

  // Adicionar tarefa
  async function adicionarTarefa() {
    if (tarefa.trim() === '' || !banco) {
      return;
    }

    try {
      await banco.runAsync(
        'INSERT INTO tarefas (nome) VALUES (?)',
        [tarefa.trim()]
      );

      setTarefa('');

      Keyboard.dismiss();

      await atualizarLista(banco);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  }

  // Excluir tarefa
  async function removerTarefa(id: number) {
    if (!banco) {
      return;
    }

    try {
      await banco.runAsync(
        'DELETE FROM tarefas WHERE id = ?',
        [id]
      );

      await atualizarLista(banco);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Título */}
      <Text style={styles.title}>
        Lista de tarefas
      </Text>

      <Text style={styles.subtitle}>
        Organize suas tarefas do dia
      </Text>

      {/* Área de adicionar tarefa */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma nova tarefa..."
          placeholderTextColor="#9ca3af"
          value={tarefa}
          onChangeText={setTarefa}
          onSubmitEditing={adicionarTarefa}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[
            styles.button,
            tarefa.trim() === '' && styles.buttonDisabled,
          ]}
          onPress={adicionarTarefa}
          disabled={tarefa.trim() === ''}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonIcon}>
            +
          </Text>

          <Text style={styles.buttonText}>
            Adicionar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantidade de tarefas */}
      <Text style={styles.quantidade}>
        {listaTarefa.length}{' '}
        {listaTarefa.length === 1
          ? 'tarefa'
          : 'tarefas'}
      </Text>

      {/* Lista de tarefas */}
      <FlatList
        style={styles.list}
        data={listaTarefa}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardTarefa}>
            <Text style={styles.textotarefa}>
              {item.nome}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => void removerTarefa(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeText}>
                Excluir
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              ✓
            </Text>

            <Text style={styles.emptyTitle}>
              Nenhuma tarefa
            </Text>

            <Text style={styles.emptyText}>
              Adicione uma tarefa para começar.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Tela principal
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // Título
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 5,
  },

  // Subtítulo
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 25,
  },

  // Área do input e botão
  inputContainer: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 4,
  },

  // Campo de texto
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,

    backgroundColor: '#f9fafb',

    paddingHorizontal: 15,

    fontSize: 16,
    color: '#111827',

    marginBottom: 10,
  },

  // Botão adicionar
  button: {
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    elevation: 4,
  },

  // Botão desativado
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Ícone +
  buttonIcon: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '400',
    marginRight: 8,
  },

  // Texto do botão
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Quantidade de tarefas
  quantidade: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },

  // Lista
  list: {
    flex: 1,
  },

  // Card da tarefa
  cardTarefa: {
    backgroundColor: '#ffffff',

    padding: 16,

    borderRadius: 14,

    marginBottom: 10,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  // Texto da tarefa
  textotarefa: {
    flex: 1,

    fontSize: 16,

    fontWeight: '600',

    color: '#1f2937',

    marginRight: 10,
  },

  // Botão excluir
  deleteButton: {
    backgroundColor: '#fef2f2',

    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: 9,
  },

  // Texto excluir
  removeText: {
    color: '#dc2626',

    fontSize: 13,

    fontWeight: '700',
  },

  // Área quando não existem tarefas
  emptyContainer: {
    alignItems: 'center',

    justifyContent: 'center',

    paddingTop: 80,
  },

  // Ícone de lista vazia
  emptyIcon: {
    width: 60,

    height: 60,

    borderRadius: 30,

    backgroundColor: '#dbeafe',

    color: '#2563eb',

    fontSize: 30,

    fontWeight: '700',

    textAlign: 'center',

    lineHeight: 60,

    marginBottom: 15,
  },

  // Título da lista vazia
  emptyTitle: {
    fontSize: 19,

    fontWeight: '700',

    color: '#374151',

    marginBottom: 5,
  },

  // Texto da lista vazia
  emptyText: {
    color: '#9ca3af',

    fontSize: 14,

    textAlign: 'center',
  },
});
