import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function FitnessChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am your AI Fitness Coach. Ask me anything about today\'s workouts or nutrition logs.', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText) return;
    const clientMessage = inputText;
    const userMsgObj = { id: Date.now().toString(), text: clientMessage, sender: 'user' };
    setMessages(prev => [...prev, userMsgObj]);
    setInputText('');
    setLoading(true);

    try {
      const timezone = 'Europe/Bucharest';
      const res = await axios.post('http://localhost:8080/api/ai/chat', {
        message: clientMessage,
        timezone: timezone
      });
      const aiMsgObj = { id: (Date.now() + 1).toString(), text: res.data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMsgObj]);
    } catch (e) {
      const errMsgObj = { id: (Date.now() + 1).toString(), text: 'Error: Failed to fetch reply from AI coach.', sender: 'ai' };
      setMessages(prev => [...prev, errMsgObj]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Coach Chat</Text>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[styles.messageText, item.sender === 'user' ? { color: '#fff' } : { color: '#000' }]}>{item.text}</Text>
          </View>
        )}
        style={styles.chatList}
      />

      {loading ? <ActivityIndicator size="small" color="#007AFF" style={{ margin: 10 }} /> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about protein, workouts..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  chatList: { flex: 1, marginBottom: 15 },
  messageBubble: { padding: 12, borderRadius: 8, marginVertical: 5, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginRight: 10, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#34C759', padding: 12, borderRadius: 6 },
  sendText: { color: '#fff', fontWeight: 'bold' }
});
