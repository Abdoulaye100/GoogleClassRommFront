import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FaPaperPlane } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Message {
    id: number;
    expediteur_id: number;
    expediteur_nom: string;
    expediteur_role: string;
    contenu: string;
    type_message: 'public' | 'prive';
    date_envoi: string;
    lu: boolean;
}

interface ChatProps {
    type: 'public' | 'prive';
    classeId?: string;
    destinataireId?: string;
    destinataireNom?: string;
    currentUserId: string;
}

function Chat({ type, classeId, destinataireId, destinataireNom, currentUserId }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            let url = '';
            
            if (type === 'public' && classeId) {
                url = `http://localhost:3000/api/messages/classe/${classeId}`;
            } else if (type === 'prive' && destinataireId) {
                url = `http://localhost:3000/api/messages/conversation/${currentUserId}/${destinataireId}`;
            } else {
                return;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            Swal.fire('Erreur', 'Impossible de charger les messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [type, classeId, destinataireId, currentUserId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            
            const messageData = {
                expediteur_id: parseInt(currentUserId),
                contenu: newMessage.trim(),
                type_message: type
            };

            if (type === 'public' && classeId) {
                messageData.classe_id = parseInt(classeId);
            } else if (type === 'prive' && destinataireId) {
                messageData.destinataire_id = parseInt(destinataireId);
            }

            const response = await fetch('http://localhost:3000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setMessages(prev => [result.data, ...prev]);
            setNewMessage('');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            Swal.fire('Erreur', 'Impossible d\'envoyer le message', 'error');
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-lg">
                        {type === 'public' ? 'Messages de la classe' : `Conversation avec ${destinataireNom}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Chargement des messages...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    {type === 'public' ? (
                        <>
                            <span>💬 Messages de la classe</span>
                            <Badge variant="secondary">{messages.length}</Badge>
                        </>
                    ) : (
                        <>
                            <span>💬 Conversation avec {destinataireNom}</span>
                            <Badge variant="secondary">{messages.length}</Badge>
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucun message pour le moment</p>
                            <p className="text-sm">Soyez le premier à envoyer un message !</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.expediteur_id === parseInt(currentUserId) 
                                        ? 'flex-row-reverse' 
                                        : 'flex-row'
                                }`}
                            >
                                <div className={`flex flex-col max-w-xs ${
                                    message.expediteur_id === parseInt(currentUserId) 
                                        ? 'items-end' 
                                        : 'items-start'
                                }`}>
                                    <div className={`rounded-lg px-3 py-2 ${
                                        message.expediteur_id === parseInt(currentUserId)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}>
                                        <p className="text-sm">{message.contenu}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">
                                            {message.expediteur_nom}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(message.date_envoi)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={type === 'public' ? 'Écrivez votre message à la classe...' : 'Écrivez votre message...'}
                            className="flex-1 resize-none"
                            rows={2}
                            disabled={sending}
                        />
                        <Button 
                            type="submit" 
                            disabled={!newMessage.trim() || sending}
                            className="self-end"
                        >
                            <FaPaperPlane className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default Chat; 