import { useState, useEffect } from 'react';
import Layout from '../shared/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaComments } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Contact {
    id: number;
    nom: string;
    email: string;
    role: string;
}

function Messages() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchContacts = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/messages/contacts/${user.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error('Erreur lors du chargement des contacts:', error);
            Swal.fire('Erreur', 'Impossible de charger les contacts', 'error');
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/messages/non-lus/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de messages non lus:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchContacts(), fetchUnreadCount()]);
            setLoading(false);
        };
        loadData();
    }, [user.id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des messages...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Messages privés</h1>
                    <p className="text-gray-600 mt-2">Conversations privées avec vos contacts</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FaComments />
                            Contacts
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-auto">
                                    {unreadCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {contacts.length} contact(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contacts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Aucun contact pour le moment</p>
                                <p className="text-sm">Commencez une conversation pour voir vos contacts ici</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contacts.map((contact) => (
                                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">
                                                    {contact.nom.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{contact.nom}</p>
                                                <p className="text-sm text-gray-600">{contact.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {contact.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}

export default Messages; 