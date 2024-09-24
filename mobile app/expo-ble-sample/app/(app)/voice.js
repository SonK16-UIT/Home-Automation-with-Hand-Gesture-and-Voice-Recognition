import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import Voice from '@wdragon/react-native-voice';
import { apiCall } from '../../api/openai';
import Loading from '../../components/Loading';
import Tts from 'react-native-tts';
import { useAuth } from '../../context/authContext';

export default function VoiceAssistant() {
    const [messages, setMessages] = useState([]);
    const [recording, setRecording] = useState(false);
    const [result, setResult] = useState('');
    const [speaking, setSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const ScrollViewRef = useRef();
    const { user, getRaspDataByUserId, GetDeviceData, updateStatus,GetMotionPictures } = useAuth();
    const [recognizedText, setRecognizedText] = useState('');
    const [inputFocused, setInputFocused] = useState(false);

    const sendMessage = () => {
        // You can implement the text input sending function here
    };

    const clearMessages = () => {
        setMessages([]);
        Tts.stop();
    };

    const speechResultHandler = async (e) => {
        const text = e.value[0];
        setResult(text);
    };

    const startRecording = async () => {
        setRecording(true);
        try {
            await Voice.start('en-US');
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const stopRecording = async () => {
        try {
            await Voice.stop();
            setRecording(false);
            fetchResponse();
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const fetchResponse = async () => {
        if (result.trim().length > 0) {
            const updatedMessages = [...messages, { role: 'user', content: result.trim() }];
            setMessages(updatedMessages);
            updateScrollView();  // Scroll to the bottom after updating messages
            setLoading(true);

            try {
                const res = await apiCall(result.trim(), updatedMessages, {
                    getRaspDataByUserId,
                    GetDeviceData,
                    updateStatus,
                    GetMotionPictures,
                    user
                });
                setLoading(false);

                if (res && res.success) {
                    setMessages(res.messages);  // Update the messages state only once with the API response
                    updateScrollView();
                    setResult('');
                    startTextToSpeech(res.messages[res.messages.length - 1]);  // Start TTS for the assistant's response
                }
            } catch (error) {
                setLoading(false);
                console.error('Fetch error:', error);
            }
        }
    };

    const startTextToSpeech = (message) => {
        if (!speaking && message.content) {
            Tts.speak(message.content, {
                androidParams: {
                    KEY_PARAM_PAN: 0,
                    KEY_PARAM_VOLUME: 2,
                    KEY_PARAM_STREAM: 'STREAM_MUSIC',
                },
            });
            setSpeaking(true);
        }
    };

    const stopSpeaking = () => {
        Tts.stop();
        setSpeaking(false);
    };

    const updateScrollView = () => {
        setTimeout(() => {
            ScrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 200);
    };

    useEffect(() => {
        Voice.onSpeechResults = speechResultHandler;
        return () => {
            Voice.destroy().then(() => {
                Voice.removeAllListeners();
            });
        };
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#1A1A2E' }}>
            <SafeAreaView style={{ flex: 1, marginHorizontal: 5 }}>
                <View style={{ flex: 1 }}>
                    <View style={styles.chatContainer}>
                        <ScrollView ref={ScrollViewRef} bounces={false} showsVerticalScrollIndicator={false}>
                            {messages.map((message, index) => {
                                if (message.role === 'assistant') {
                                    return (
                                        <View key={index} style={{ paddingTop: 10 }}>
                                            <View key={index} style={{ width: wp(70),backgroundColor: '#55608f' }} className="rounded-xl p-2 rounded-tl-none" >
                                                <Text>{message.content}</Text>
                                                {message.image && (  // Render the image if present in the message
                                                    <Image
                                                        source={{ uri: message.image.url }}
                                                        style={{ width: wp(60), height: hp(30),marginTop: 10, borderRadius: 10}}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    );
                                } else {
                                    return (
                                        <View style={{paddingTop: 10}}>
                                            <View key={index} className="flex-row justify-end">
                                                <View style={{ width: wp(70) }} className="bg-white rounded-xl p-2 rounded-tr-none">
                                                    <Text>{message.content}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }
                            })}
                        </ScrollView>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                styles.input,
                                inputFocused && styles.inputFocused
                            ]}
                            placeholder="Type your message..."
                            placeholderTextColor="white"
                            value={recognizedText}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onChangeText={setRecognizedText}
                        />
                        {!inputFocused && (
                            <>
                                {loading ? (
                                    <Loading size={hp(5)} />
                                ) : recording ? (
                                    <TouchableOpacity onPress={stopRecording} style={styles.recordButtonStop}>
                                        <FontAwesome name="microphone" size={24} color="white" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={startRecording} style={styles.recordButtonStart}>
                                        <FontAwesome name="microphone" size={24} color="white" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={clearMessages} style={styles.clearButton}>
                                    <Text style={styles.clearButtonText}>Clear</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {inputFocused && (
                            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    recordButtonStart: {
        marginLeft: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#28a745', // Green for start recording
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButtonStop: {
        marginLeft: 10,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e74c3c', // Red for stop recording
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF5E0',
      },
      messagesContainer: {
        padding: 10,
      },
      messageBubble: {
        maxWidth: '70%',
        marginVertical: 5,
        borderRadius: 10,
        padding: 10,
      },
      messageText: {
        color: 'white',
        fontSize: 16,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1A1A2E', // Dark input background
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#2B2B4C',
    },
      voiceButton: {
        marginLeft: 10,
        fontSize: 24,
      },
      voiceButtonText: {
        fontSize: 24,
        height: 45,
      },
      sendButton: {
        marginLeft: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FF6969',
        borderRadius: 20,
      },
      sendButtonText: {
        color: 'white',
        fontSize: 16,
      },
      chatContainer: {
        flex: 1,
        backgroundColor: '#2B2B4C', // Dark chat background
        borderRadius: 10,
        padding: 10,
        marginTop: 15,
        marginBottom: 10,
    },
    clearButton: {
        marginLeft: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#6a6f8d', // Greyish color for the clear button
        borderRadius: 20,
    },
    clearButtonText: {
        color: '#fff', // White text for the clear button
        fontSize: 16,
    },
});
