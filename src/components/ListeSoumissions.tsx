import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Swal from 'sweetalert2';
import { FaDownload, FaEye, FaTrash, FaEdit, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface Soumission {
    id: number;
    tache_id: number;
    etudiant_id: number;
    etudiant_nom: string;
    matricule: string;
    fichier_soumis: string;
    commentaire: string;
    date_soumission: string;
    tache_titre: string;
    date_limite: string;
}

interface ListeSoumissionsProps {
    tacheId: string;
    userRole: string;
    onSoumissionUpdate?: () => void;
}

function ListeSoumissions({ tacheId, userRole, onSoumissionUpdate }: ListeSoumissionsProps) {
    const [soumissions, setSoumissions] = useState<Soumission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalSoumissions: 0,
        soumissionsEnRetard: 0,
        totalEtudiants: 0,
        tauxSoumission: 0
    });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchSoumissions = async () => {
        try {
            console.log('Fetching soumissions for task:', tacheId);
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:3000/api/soumissions/tache/${tacheId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Soumissions data:', data);
            setSoumissions(data);
        } catch (error) {
            console.error('Erreur lors du chargement des soumissions:', error);
            setError('Erreur lors du chargement des soumissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            console.log('Fetching stats for task:', tacheId);
            const response = await fetch(`http://localhost:3000/api/soumissions/stats/tache/${tacheId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Stats data:', data);
                setStats(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    useEffect(() => {
        console.log('ListeSoumissions useEffect triggered with tacheId:', tacheId);
        if (tacheId) {
            fetchSoumissions();
            fetchStats();
        }
    }, [tacheId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Chargement des soumissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button 
                    onClick={() => fetchSoumissions()} 
                    size="sm"
                >
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-blue-600">{stats.totalSoumissions}</div>
                        <p className="text-xs text-gray-600">Soumissions totales</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-red-600">{stats.soumissionsEnRetard}</div>
                        <p className="text-xs text-gray-600">En retard</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-green-600">{stats.tauxSoumission}%</div>
                        <p className="text-xs text-gray-600">Taux de soumission</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-purple-600">{stats.totalEtudiants}</div>
                        <p className="text-xs text-gray-600">Étudiants inscrits</p>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des soumissions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Soumissions des étudiants</CardTitle>
                    <CardDescription>
                        {soumissions.length === 0 ? 'Aucune soumission pour le moment' : `${soumissions.length} soumission(s)`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {soumissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucune soumission pour le moment</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {soumissions.map((soumission) => (
                                <div key={soumission.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-sm truncate">{soumission.etudiant_nom}</h4>
                                                <Badge variant="outline" className="text-xs">{soumission.matricule}</Badge>
                                            </div>
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <p>Soumis le: {formatDate(soumission.date_soumission)}</p>
                                                {soumission.commentaire && (
                                                    <p className="break-words">Commentaire: {soumission.commentaire}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                            {soumission.fichier_soumis && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(`http://localhost:3000/api/soumissions/download/${soumission.fichier_soumis}`);
                                                            if (!response.ok) {
                                                                throw new Error(`HTTP error! status: ${response.status}`);
                                                            }
                                                            
                                                            const blob = await response.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = soumission.fichier_soumis;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(a);
                                                        } catch (error) {
                                                            console.error('Erreur lors du téléchargement:', error);
                                                            Swal.fire('Erreur', 'Impossible de télécharger le fichier', 'error');
                                                        }
                                                    }}
                                                >
                                                    <FaDownload className="mr-1 h-3 w-3" />
                                                    Télécharger
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ListeSoumissions; 