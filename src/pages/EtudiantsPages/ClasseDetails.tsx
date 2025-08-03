import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../shared/layout';
import ListeDocuments from '../../components/listeDocuments';
import ListeTaches from '../../components/ListeTaches';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Chat from '@/components/Chat';

function ClasseDetails() {
    const { id } = useParams(); // id de la classe
    const [classe, setClasse] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchClasse = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/classes/byId/${id}`);
                const data = await response.json();
                
                if (!data) {
                    console.error("Classe non trouvée");
                    setClasse({ nom: "Classe non trouvée" });
                } else {
                    setClasse(data);
                }
            } catch (err) {
                console.error("Erreur de chargement de la classe", err);
                setClasse({ nom: "Erreur de chargement" });
            } finally {
                setLoading(false);
            }
        };

        fetchClasse();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header avec informations de la classe */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{classe?.nom}</h1>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Code: {classe?.code}
                                </span>
                                <span>Année: {classe?.annee}</span>
                                <Badge variant="secondary">Étudiant</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onglets principaux */}
                <Tabs defaultValue="taches" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="taches" className="flex items-center gap-2">
                            📋 Tâches et Devoirs
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                            📚 Documentation
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="flex items-center gap-2">
                            💬 Messages
                        </TabsTrigger>
                        <TabsTrigger value="info" className="flex items-center gap-2">
                            ℹ️ Informations
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Tâches */}
                    <TabsContent value="taches" className="space-y-4">
                        <ListeTaches classeId={id || ''} userRole={user.role} />
                    </TabsContent>

                    {/* Onglet Documents */}
                    <TabsContent value="documents" className="space-y-4">
                        <ListeDocuments classeId={id} />
                    </TabsContent>

                    {/* Onglet Messages */}
                    <TabsContent value="messages" className="space-y-4">
                        <Chat 
                            type="public"
                            classeId={id || ''}
                            currentUserId={user.id}
                        />
                    </TabsContent>

                    {/* Onglet Informations */}
                    <TabsContent value="info" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails de la classe</CardTitle>
                                <CardDescription>
                                    Informations générales sur cette classe
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Nom de la classe</h4>
                                        <p className="text-gray-600">{classe?.nom}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Code d'accès</h4>
                                        <p className="text-gray-600">{classe?.code}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Année académique</h4>
                                        <p className="text-gray-600">{classe?.annee}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Professeur</h4>
                                        <p className="text-gray-600">
                                            {classe?.professeur_nom || 'Non assigné'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}

export default ClasseDetails; 