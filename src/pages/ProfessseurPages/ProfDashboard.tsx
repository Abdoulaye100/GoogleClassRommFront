import { useState, useEffect } from 'react';
import Layout from '../shared/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaUsers, FaFileAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalTasks: number;
  totalDocuments: number;
  pendingSubmissions: number;
  recentActivity: any[];
}

interface RecentClass {
  id: number;
  nom: string;
  code: string;
  etudiants_count: number;
  taches_count: number;
  documents_count: number;
}

function ProfDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalTasks: 0,
    totalDocuments: 0,
    pendingSubmissions: 0,
    recentActivity: []
  });
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Utilisateur connecté:', user);
      
      // Récupérer les statistiques globales
      const statsResponse = await fetch(`http://localhost:3000/api/classes/stats/professeur/${user.id}`);
      if (!statsResponse.ok) {
        throw new Error(`Erreur HTTP: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      
      // Récupérer les classes récentes
      const classesResponse = await fetch(`http://localhost:3000/api/classes/professeur/${user.id}`);
      if (!classesResponse.ok) {
        throw new Error(`Erreur HTTP: ${classesResponse.status}`);
      }
      const classesData = await classesResponse.json();
      
      console.log('Stats reçues:', statsData);
      console.log('Classes reçues:', classesData);
      
      setStats(statsData);
      setRecentClasses(classesData.slice(0, 4)); // Limiter à 4 classes récentes
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setError('Impossible de charger les données du dashboard');
      
      // Afficher des données de test si aucune donnée n'est disponible
      setStats({
        totalClasses: 0,
        totalStudents: 0,
        totalTasks: 0,
        totalDocuments: 0,
        pendingSubmissions: 0,
        recentActivity: []
      });
      setRecentClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const getStatusColor = (count: number) => {
    if (count === 0) return 'text-gray-500';
    if (count < 5) return 'text-green-600';
    if (count < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user.nom} ! Voici un aperçu de vos activités.</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-1">ID utilisateur: {user.id}</p>
            </div>
          )}
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                Classes actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalClasses}</div>
              <p className="text-sm text-gray-600">Classes créées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaGraduationCap className="text-green-600" />
                Étudiants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
              <p className="text-sm text-gray-600">Étudiants inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaFileAlt className="text-purple-600" />
                Tâches actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
              <p className="text-sm text-gray-600">Devoirs créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-600" />
                Soumissions en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getStatusColor(stats.pendingSubmissions)}`}>
                {stats.pendingSubmissions}
              </div>
              <p className="text-sm text-gray-600">À corriger</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Classes récentes</span>
                <Link to="/professeur/classes">
                  <Button variant="outline" size="sm">
                    Voir toutes
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Vos classes les plus actives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune classe créée</p>
                  <p className="text-sm">Créez votre première classe pour commencer</p>
                  <Link to="/professeur/classes">
                    <Button className="mt-4">
                      Créer une classe
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentClasses.map((classe) => (
                    <div key={classe.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaGraduationCap className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{classe.nom}</h4>
                          <p className="text-sm text-gray-600">Code: {classe.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FaUsers className="text-gray-400" />
                            {classe.etudiants_count} étudiant(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <FaFileAlt className="text-gray-400" />
                            {classe.taches_count} tâche(s)
                          </span>
                        </div>
                        <Link to={`/prof/classes/${classe.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Voir détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaChartLine />
                Activité récente
              </CardTitle>
              <CardDescription>
                Dernières actions dans vos classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune activité récente</p>
                  <p className="text-sm">Les actions apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default ProfDashboard;
