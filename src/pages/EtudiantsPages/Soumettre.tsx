import { useState, useEffect } from 'react';
import Layout from '../shared/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Swal from 'sweetalert2';
import { FaDownload, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Soumission {
    id: number;
    tache_id: number;
    etudiant_id: number;
    fichier_soumis: string;
    commentaire: string;
    date_soumission: string;
    tache_titre: string;
    date_limite: string;
    classe_nom: string;
}

interface Tache {
    id: number;
    titre: string;
    description: string;
    date_limite: string;
    classe_id: number;
    classe_nom: string;
}

function Soumettre() {
    const [soumissions, setSoumissions] = useState<Soumission[]>([]);
    const [tachesDisponibles, setTachesDisponibles] = useState<Tache[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour les modals
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
    const [selectedSoumission, setSelectedSoumission] = useState<Soumission | null>(null);
    const [commentaire, setCommentaire] = useState('');
    const [fichier, setFichier] = useState<File | null>(null);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchSoumissions = async () => {
        try {
            console.log('Fetching soumissions for user:', user.id);
            const response = await fetch(`http://localhost:3000/api/soumissions/etudiant/${user.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Soumissions data:', data);
            setSoumissions(data);
            return data;
        } catch (error) {
            console.error('Erreur lors du chargement des soumissions:', error);
            setError('Erreur lors du chargement des soumissions');
            return [];
        }
    };

    const fetchTachesDisponibles = async (soumissionsActuelles: Soumission[] = []) => {
        try {
            console.log('Fetching classes for user:', user.id);
            const classesResponse = await fetch(`http://localhost:3000/api/classes/etudiant/${user.id}`);
            if (!classesResponse.ok) {
                throw new Error(`HTTP error! status: ${classesResponse.status}`);
            }
            const classes = await classesResponse.json();
            console.log('Classes data:', classes);
            
            const allTaches: Tache[] = [];
            for (const classe of classes) {
                const tachesResponse = await fetch(`http://localhost:3000/api/taches/classe/${classe.id}`);
                if (tachesResponse.ok) {
                    const taches = await tachesResponse.json();
                    allTaches.push(...taches.map((tache: any) => ({ ...tache, classe_nom: classe.nom })));
                }
            }
            
            const tachesSoumises = soumissionsActuelles.map(s => s.tache_id);
            const tachesDisponibles = allTaches.filter(tache => !tachesSoumises.includes(tache.id));
            
            console.log('Tâches disponibles:', tachesDisponibles);
            setTachesDisponibles(tachesDisponibles);
        } catch (error) {
            console.error('Erreur lors du chargement des tâches disponibles:', error);
            setError('Erreur lors du chargement des tâches disponibles');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            console.log('Début du chargement des données...');
            setLoading(true);
            setError(null);
            try {
                const soumissionsData = await fetchSoumissions();
                await fetchTachesDisponibles(soumissionsData);
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Fonction pour soumettre un devoir
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedTache || !fichier) {
            Swal.fire('Erreur', 'Veuillez sélectionner une tâche et un fichier', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('tache_id', selectedTache.id.toString());
        formData.append('etudiant_id', user.id);
        formData.append('fichier', fichier);
        if (commentaire) {
            formData.append('commentaire', commentaire);
        }

        try {
            const response = await fetch('http://localhost:3000/api/soumissions', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Succès', data.message, 'success');
                setShowSubmitDialog(false);
                setCommentaire('');
                setFichier(null);
                setSelectedTache(null);
                
                // Recharger les données
                const soumissionsData = await fetchSoumissions();
                await fetchTachesDisponibles(soumissionsData);
            } else {
                Swal.fire('Erreur', data.message, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            Swal.fire('Erreur', 'Erreur serveur', 'error');
        }
    };

    // Fonction pour modifier une soumission
    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSoumission) return;

        try {
            const response = await fetch(`http://localhost:3000/api/soumissions/${selectedSoumission.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ commentaire })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Succès', data.message, 'success');
                setShowEditDialog(false);
                setCommentaire('');
                setSelectedSoumission(null);
                
                // Recharger les données
                const soumissionsData = await fetchSoumissions();
                await fetchTachesDisponibles(soumissionsData);
            } else {
                Swal.fire('Erreur', data.message, 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            Swal.fire('Erreur', 'Erreur serveur', 'error');
        }
    };

    // Fonction pour supprimer une soumission
    const handleDelete = async (soumissionId: number) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/api/soumissions/${soumissionId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire('Supprimé !', data.message, 'success');
                    
                    // Recharger les données
                    const soumissionsData = await fetchSoumissions();
                    await fetchTachesDisponibles(soumissionsData);
                } else {
                    Swal.fire('Erreur', data.message, 'error');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                Swal.fire('Erreur', 'Erreur serveur', 'error');
            }
        }
    };

    // Fonction pour ouvrir le modal de soumission
    const openSubmitDialog = (tache: Tache) => {
        setSelectedTache(tache);
        setShowSubmitDialog(true);
    };

    // Fonction pour ouvrir le modal de modification
    const openEditDialog = (soumission: Soumission) => {
        setSelectedSoumission(soumission);
        setCommentaire(soumission.commentaire || '');
        setShowEditDialog(true);
    };

    // Fonction pour télécharger un fichier
    const downloadFile = async (filename: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/soumissions/download/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            Swal.fire('Erreur', 'Impossible de télécharger le fichier', 'error');
        }
    };

    // Fonction pour vérifier si une soumission est en retard
    const isEnRetard = (dateSoumission: string, dateLimite: string) => {
        return new Date(dateSoumission) > new Date(dateLimite);
    };

    // Fonction pour formater une date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    // Vérifier si l'utilisateur est connecté
    if (!user.id) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
                        <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement en cours...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur</h2>
                        <p className="text-gray-600">{error}</p>
                        <Button 
                            onClick={() => window.location.reload()} 
                            className="mt-4"
                        >
                            Réessayer
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mes soumissions</h1>
                    <p className="text-gray-600 mt-2">Gérez vos soumissions de devoirs</p>
                </div>

                <Tabs defaultValue="soumissions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="soumissions" className="flex items-center gap-2">
                            📤 Mes soumissions ({soumissions.length})
                        </TabsTrigger>
                        <TabsTrigger value="disponibles" className="flex items-center gap-2">
                            📋 Tâches disponibles ({tachesDisponibles.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet Mes soumissions */}
                                         <TabsContent value="soumissions" className="space-y-6">
                         {soumissions.length === 0 ? (
                             <Card>
                                 <CardContent className="text-center py-8">
                                     <p className="text-gray-500">Aucune soumission pour le moment</p>
                                 </CardContent>
                             </Card>
                         ) : (
                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                 {soumissions.map((soumission) => (
                                     <Card key={soumission.id} className="hover:shadow-lg transition-shadow">
                                         <CardHeader>
                                             <div className="flex items-start justify-between">
                                                 <div className="flex-1">
                                                     <CardTitle className="text-lg">{soumission.tache_titre}</CardTitle>
                                                     <CardDescription>
                                                         Classe: {soumission.classe_nom}
                                                     </CardDescription>
                                                 </div>
                                                 {isEnRetard(soumission.date_soumission, soumission.date_limite) ? (
                                                     <Badge variant="destructive" className="flex items-center gap-1">
                                                         <FaExclamationTriangle className="text-xs" />
                                                         En retard
                                                     </Badge>
                                                 ) : (
                                                     <Badge variant="default" className="flex items-center gap-1">
                                                         <FaCheckCircle className="text-xs" />
                                                         À temps
                                                     </Badge>
                                                 )}
                                             </div>
                                         </CardHeader>
                                         <CardContent>
                                             <div className="space-y-3">
                                                 <p className="text-sm text-gray-600">
                                                     Soumis le: {formatDate(soumission.date_soumission)}
                                                 </p>
                                                 {soumission.commentaire && (
                                                     <p className="text-sm text-gray-600">
                                                         Commentaire: {soumission.commentaire}
                                                     </p>
                                                 )}
                                                 <div className="flex items-center gap-2 pt-2">
                                                     {soumission.fichier_soumis && (
                                                         <Button
                                                             variant="outline"
                                                             size="sm"
                                                             onClick={() => downloadFile(soumission.fichier_soumis)}
                                                         >
                                                             <FaDownload className="mr-1" />
                                                             Télécharger
                                                         </Button>
                                                     )}
                                                     <Button
                                                         variant="outline"
                                                         size="sm"
                                                         onClick={() => openEditDialog(soumission)}
                                                     >
                                                         <FaEdit className="mr-1" />
                                                         Modifier
                                                     </Button>
                                                     <Button
                                                         variant="outline"
                                                         size="sm"
                                                         onClick={() => handleDelete(soumission.id)}
                                                     >
                                                         <FaTrash className="mr-1" />
                                                         Supprimer
                                                     </Button>
                                                 </div>
                                             </div>
                                         </CardContent>
                                     </Card>
                                 ))}
                             </div>
                         )}
                     </TabsContent>

                    {/* Onglet Tâches disponibles */}
                                         <TabsContent value="disponibles" className="space-y-6">
                         {tachesDisponibles.length === 0 ? (
                             <Card>
                                 <CardContent className="text-center py-8">
                                     <p className="text-gray-500">Aucune tâche disponible pour le moment</p>
                                 </CardContent>
                             </Card>
                         ) : (
                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                 {tachesDisponibles.map((tache) => (
                                     <Card key={tache.id} className="hover:shadow-lg transition-shadow">
                                         <CardHeader>
                                             <CardTitle className="text-lg">{tache.titre}</CardTitle>
                                             <CardDescription>
                                                 Classe: {tache.classe_nom}
                                             </CardDescription>
                                         </CardHeader>
                                         <CardContent>
                                             <div className="space-y-4">
                                                 <p className="text-sm text-gray-600">{tache.description}</p>
                                                 <div className="flex items-center justify-between">
                                                     <Badge variant="secondary">
                                                         Date limite: {new Date(tache.date_limite).toLocaleDateString('fr-FR')}
                                                     </Badge>
                                                     <Button
                                                         onClick={() => openSubmitDialog(tache)}
                                                         className="flex items-center gap-2"
                                                     >
                                                         <FaPlus className="text-xs" />
                                                         Soumettre
                                                     </Button>
                                                 </div>
                                             </div>
                                         </CardContent>
                                     </Card>
                                 ))}
                             </div>
                         )}
                     </TabsContent>
                                 </Tabs>
             </div>

             {/* Modal de soumission */}
             <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                 <DialogContent className="max-w-md">
                     <DialogHeader>
                         <DialogTitle>Soumettre un devoir</DialogTitle>
                         <DialogDescription>
                             Rendez votre travail pour : {selectedTache?.titre}
                         </DialogDescription>
                     </DialogHeader>
                     <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                             <Label htmlFor="fichier">Fichier *</Label>
                             <Input
                                 id="fichier"
                                 type="file"
                                 onChange={(e) => setFichier(e.target.files?.[0] || null)}
                                 required
                                 accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                             />
                             <p className="text-xs text-gray-500 mt-1">
                                 Formats acceptés: PDF, Word, TXT, Images, ZIP (max 10MB)
                             </p>
                         </div>
                         <div>
                             <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                             <Textarea
                                 id="commentaire"
                                 value={commentaire}
                                 onChange={(e) => setCommentaire(e.target.value)}
                                 placeholder="Ajoutez un commentaire à votre soumission..."
                                 rows={3}
                             />
                         </div>
                         <div className="flex justify-end space-x-2">
                             <Button type="button" variant="outline" onClick={() => setShowSubmitDialog(false)}>
                                 Annuler
                             </Button>
                             <Button type="submit">
                                 Soumettre
                             </Button>
                         </div>
                     </form>
                 </DialogContent>
             </Dialog>

             {/* Modal de modification */}
             <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                 <DialogContent className="max-w-md">
                     <DialogHeader>
                         <DialogTitle>Modifier le commentaire</DialogTitle>
                         <DialogDescription>
                             Modifiez le commentaire de votre soumission
                         </DialogDescription>
                     </DialogHeader>
                     <form onSubmit={handleEdit} className="space-y-4">
                         <div>
                             <Label htmlFor="edit-commentaire">Commentaire</Label>
                             <Textarea
                                 id="edit-commentaire"
                                 value={commentaire}
                                 onChange={(e) => setCommentaire(e.target.value)}
                                 placeholder="Modifiez votre commentaire..."
                                 rows={3}
                             />
                         </div>
                         <div className="flex justify-end space-x-2">
                             <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                 Annuler
                             </Button>
                             <Button type="submit">
                                 Modifier
                             </Button>
                         </div>
                     </form>
                 </DialogContent>
             </Dialog>
         </Layout>
     );
 }

export default Soumettre; 