import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import ListeSoumissions from './ListeSoumissions';
import CustomModal from './CustomModal';
import './ModalStyles.css';

interface Tache {
  id: number;
  titre: string;
  description: string;
  date_limite: string;
  classe_id: number;
}

interface ListeTachesProps {
  classeId: string;
  userRole: string;
}

export default function ListeTaches({ classeId, userRole }: ListeTachesProps) {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSoumissionsModal, setShowSoumissionsModal] = useState(false);
  const [selectedTache, setSelectedTache] = useState<Tache | null>(null);
  const [editingTache, setEditingTache] = useState<Tache | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_limite: ''
  });

  const fetchTaches = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/taches/classe/${classeId}`);
      const data = await response.json();
      setTaches(data);
    } catch (error) {
      console.error('Erreur de chargement des tâches', error);
    }
  };

  useEffect(() => {
    fetchTaches();
  }, [classeId]);

  const handleCreateTache = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/taches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          classe_id: classeId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Succès', data.message, 'success');
        setShowCreateModal(false);
        setFormData({ titre: '', description: '', date_limite: '' });
        fetchTaches();
      } else {
        Swal.fire('Erreur', data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la création', error);
      Swal.fire('Erreur', 'Erreur serveur', 'error');
    }
  };

  const handleEditTache = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTache) return;

    try {
      const response = await fetch(`http://localhost:3000/api/taches/${editingTache.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Succès', data.message, 'success');
        setShowEditModal(false);
        setEditingTache(null);
        setFormData({ titre: '', description: '', date_limite: '' });
        fetchTaches();
      } else {
        Swal.fire('Erreur', data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la modification', error);
      Swal.fire('Erreur', 'Erreur serveur', 'error');
    }
  };

  const handleDeleteTache = async (id: number) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/taches/${id}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (response.ok) {
            Swal.fire('Succès', data.message, 'success');
            fetchTaches();
          } else {
            Swal.fire('Erreur', data.message, 'error');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression', error);
          Swal.fire('Erreur', 'Erreur serveur', 'error');
        }
      }
    });
  };

  const openEditModal = (tache: Tache) => {
    setEditingTache(tache);
    setFormData({
      titre: tache.titre,
      description: tache.description,
      date_limite: tache.date_limite
    });
    setShowEditModal(true);
  };

  const openSoumissionsModal = (tache: Tache) => {
    console.log('🔍 Ouverture du modal des soumissions pour la tâche:', tache);
    setSelectedTache(tache);
    setShowSoumissionsModal(true);
    console.log('🔍 Modal ouvert, selectedTache:', tache);
  };

  const getStatusBadge = (dateLimite: string) => {
    const today = new Date();
    const limite = new Date(dateLimite);
    const diffTime = limite.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">En retard</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="secondary">Urgent</Badge>;
    } else {
      return <Badge variant="default">En cours</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {userRole === 'professeur' && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <FaPlus className="mr-2" />
              Créer une tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle tâche pour vos étudiants
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTache} className="space-y-4">
              <div>
                <Label htmlFor="titre" className='mb-2'>Titre</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className='mb-2'>Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_limite" className='mb-2'>Date limite</Label>
                <Input
                  id="date_limite"
                  type="date"
                  value={formData.date_limite}
                  onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {taches.map((tache) => (
          <Card key={tache.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{tache.titre}</CardTitle>
                {userRole === 'professeur' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(tache)}
                    >
                      <FaEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTache(tache.id)}
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                Date limite: {new Date(tache.date_limite).toLocaleDateString('fr-FR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{tache.description}</p>
              <div className="flex justify-between items-center">
                {getStatusBadge(tache.date_limite)}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openSoumissionsModal(tache)}
                >
                  <FaEye className="h-4 w-4 mr-1" />
                  Voir soumissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {taches.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Aucune tâche pour le moment</p>
          </CardContent>
        </Card>
      )}

      {/* Modal d'édition */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
            <DialogDescription>
              Modifiez les détails de cette tâche
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTache} className="space-y-4">
            <div>
              <Label htmlFor="edit-titre">Titre</Label>
              <Input
                id="edit-titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-date_limite">Date limite</Label>
              <Input
                id="edit-date_limite"
                type="date"
                value={formData.date_limite}
                onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit">Modifier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal des soumissions personnalisé */}
      <CustomModal
        isOpen={showSoumissionsModal}
        onClose={() => setShowSoumissionsModal(false)}
        title={`Soumissions - ${selectedTache?.titre || 'Tâche'}`}
        size="xl"
      >
        {selectedTache ? (
          <div className="modal-content-scroll">
            <ListeSoumissions 
              tacheId={selectedTache.id.toString()} 
              userRole={userRole}
              onSoumissionUpdate={() => {
                console.log('🔄 Soumission mise à jour');
              }}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune tâche sélectionnée</p>
          </div>
        )}
      </CustomModal>
    </div>
  );
} 