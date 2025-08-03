import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import Layout from '../shared/layout';
import ListeDocuments from '../../components/listeDocuments';
import ListeTaches from '../../components/ListeTaches';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaComments } from 'react-icons/fa';
import Chat from '@/components/Chat';

function ClasseDetails() {
    const { id } = useParams(); // id de la classe
    const [etudiants, setEtudiants] = useState([]);
    const [classe, setClasse] = useState<any | null>();
    const [stats, setStats] = useState({ taches: 0, documents: 0, etudiants: 0 });
    const [showModal, setShowModal] = useState(false);
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [fichier, setFichier] = useState<File | null>(null);
    const listeDocumentsRef = useRef<any>(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fonction pour recharger les étudiants et les statistiques
    const reloadEtudiants = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/classes/${id}/etudiants`);
            const data = await response.json();
            setEtudiants(data);
            await fetchStats();
        } catch (err) {
            console.error("Erreur de chargement des étudiants", err);
        }
    };

    // Fonction pour récupérer les statistiques
    const fetchStats = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/classes/stats/${id}`);
            const data = await response.json();
            setStats(data);
            console.log("Statistiques mises à jour:", data); // Debug
        } catch (error) {
            console.error("Erreur de chargement des statistiques", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Charger les données de la classe
                const classeResponse = await fetch(`http://localhost:3000/api/classes/byId/${id}`);
                const classeData = await classeResponse.json();
                
                if (!classeData) {
            console.error("Classe non trouvée");
            setClasse({ nom: "Classe non trouvée" });
            return;
            }
                setClasse(classeData);
                
                // Charger les étudiants
                const etudiantsResponse = await fetch(`http://localhost:3000/api/classes/${id}/etudiants`);
                const etudiantsData = await etudiantsResponse.json();
                setEtudiants(etudiantsData);
                
                // Charger les statistiques
                await fetchStats();
                
            } catch (err) {
                console.error("Erreur de chargement des données", err);
            }
        };
        
        loadData();
    }, [id]);


    function retirerEtudiant(id: any, clId:any): void {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez vous vraiment rétirer cet etudiant ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:3000/api/classes/retirerEtudiant/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body : JSON.stringify({ classId : clId })
                })
                .then(res => res.json())
                .then(data =>{
                    Swal.fire('Succès', data.message, 'success')
                    reloadEtudiants();
                })
                .catch(err => console.error("Erreur de chargement", err));
            }
        });
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Header avec informations de la classe */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{classe ? classe.nom : ""}</h1>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Code: {classe?.code}
                                </span>
                                <span>Année: {classe?.annee}</span>
                                <Badge variant="secondary">{etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''}</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowModal(true)}>
                                📚 Ajouter un document
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Onglets principaux */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            📊 Vue d'ensemble
                        </TabsTrigger>
                        <TabsTrigger value="taches" className="flex items-center gap-2">
                            📋 Tâches
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                            📚 Documents
                        </TabsTrigger>
                        <TabsTrigger value="etudiants" className="flex items-center gap-2">
                            👥 Étudiants
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="flex items-center gap-2">
                            💬 Messages
                        </TabsTrigger>
                    </TabsList>

                    {/* Vue d'ensemble */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                         <Card>
                                 <CardHeader className="pb-3">
                                     <CardTitle className="text-lg flex items-center gap-2">
                                         📋 Tâches actives
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <div className="text-3xl font-bold text-blue-600">{stats.taches}</div>
                                     <p className="text-sm text-gray-600">Tâches en cours</p>
                                 </CardContent>
                             </Card>

                             <Card>
                                 <CardHeader className="pb-3">
                                     <CardTitle className="text-lg flex items-center gap-2">
                                         📚 Documents
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <div className="text-3xl font-bold text-green-600">{stats.documents}</div>
                                     <p className="text-sm text-gray-600">Documents partagés</p>
                                 </CardContent>
                             </Card>

                             <Card>
                                 <CardHeader className="pb-3">
                                     <CardTitle className="text-lg flex items-center gap-2">
                                         👥 Étudiants
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <div className="text-3xl font-bold text-purple-600">{stats.etudiants}</div>
                                     <p className="text-sm text-gray-600">Étudiants inscrits</p>
                                 </CardContent>
                             </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dernières activités</CardTitle>
                                <CardDescription>
                                    Aperçu des dernières activités de la classe
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    Aucune activité récente
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Onglet Tâches */}
                    <TabsContent value="taches" className="space-y-4">
                        <ListeTaches classeId={id || ''} userRole={user.role} />
                    </TabsContent>

                    {/* Onglet Documents */}
                    <TabsContent value="documents" className="space-y-4">
                        <ListeDocuments ref={listeDocumentsRef} classeId={id} />
                    </TabsContent>

                    {/* Onglet Étudiants */}
                    <TabsContent value="etudiants" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Liste des étudiants</CardTitle>
                                <CardDescription>
                                    Gérez les étudiants de cette classe
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                {etudiants.length > 0 ? (
                                    <div className="space-y-3">
                    {etudiants.map((etudiant: any) => (
                                            <div key={etudiant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold">
                                                            {etudiant.nom.charAt(0).toUpperCase()}
                            </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{etudiant.nom}</p>
                                                        <p className="text-sm text-gray-600">Matricule: {etudiant.matricule}</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => retirerEtudiant(etudiant.id, id)}
                                                >
                                                    Retirer
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucun étudiant inscrit pour le moment
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Onglet Messages */}
                    <TabsContent value="messages" className="space-y-4">
                        <Chat 
                            type="public"
                            classeId={id || ''}
                            currentUserId={user.id}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded w-[400px]">
                    <h2 className="text-lg font-bold mb-4">Partager une documentation</h2>
                    <form
                        onSubmit={async (e) => {
                        e.preventDefault();
                        if (!fichier) return alert("Veuillez sélectionner un fichier.");

                        const formData = new FormData();
                        formData.append('titre', titre);
                        formData.append('description', description);
                        formData.append('classeId', id || '');
                        formData.append('fichier', fichier);

                        try {
                            const res = await fetch('http://localhost:3000/api/documents/addDocumentations', {
                            method: 'POST',
                            body: formData,
                            });

                            const data = await res.json();

                            if (res.ok) {
                                Swal.fire('Succès', data.message, 'success');
                                setShowModal(false);
                                setTitre('');
                                setDescription('');
                                setFichier(null);
                                // Recharger les documents
                                if (listeDocumentsRef.current) {
                                    listeDocumentsRef.current.fetchDocuments();
                                }
                                // Mettre à jour les statistiques après avoir ajouté un document
                                fetchStats();
                            } else {
                               Swal.fire('Erreur', data.message, 'error');
                            }
                        } catch (err) {
                            console.error(err);
                            Swal.fire('Erreur', 'Erreur serveur', 'error');
                        }
                        }}
                        className="space-y-3"
                    >
                        <input
                        type="text"
                        placeholder="Titre"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                        />
                        <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                        />
                        <input
                        type="file"
                        onChange={(e) => setFichier(e.target.files?.[0] || null)}
                        className="w-full"
                        required
                        />
                        <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-1 bg-gray-400 rounded text-white">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-1 bg-green-600 rounded text-white">
                            Envoyer
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            )}

        </Layout>
    );
}

export default ClasseDetails;
