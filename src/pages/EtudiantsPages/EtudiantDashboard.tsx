import { useState, useEffect } from 'react';
import Layout from '../shared/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaGraduationCap, FaFileAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaUsers, FaChartLine, FaBook } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

interface DashboardStats {
  totalClasses: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalSubmissions: number;
  recentActivity: any[];
}

interface RecentClass {
  id: number;
  nom: string;
  code: string;
  professeur_nom: string;
  taches_count: number;
  documents_count: number;
}

interface UpcomingTask {
  id: number;
  titre: string;
  classe_nom: string;
  date_limite: string;
  description: string;
}

function EtudiantDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalSubmissions: 0,
    recentActivity: []
  });
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Utilisateur étudiant connecté:', user);
      
      // Récupérer les statistiques de l'étudiant
      const statsResponse = await fetch(`http://localhost:3000/api/classes/stats/etudiant/${user.id}`);
      if (!statsResponse.ok) {
        throw new Error(`Erreur HTTP: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      
      // Récupérer les classes de l'étudiant
      const classesResponse = await fetch(`http://localhost:3000/api/classes/etudiant/${user.id}`);
      if (!classesResponse.ok) {
        throw new Error(`Erreur HTTP: ${classesResponse.status}`);
      }
      const classesData = await classesResponse.json();
      
      // Récupérer les tâches à venir
      const tasksResponse = await fetch(`http://localhost:3000/api/taches/etudiant/${user.id}/upcoming`);
      if (!tasksResponse.ok) {
        throw new Error(`Erreur HTTP: ${tasksResponse.status}`);
      }
      const tasksData = await tasksResponse.json();
      
      console.log('Stats étudiant reçues:', statsData);
      console.log('Classes étudiant reçues:', classesData);
      console.log('Tâches à venir reçues:', tasksData);
      
      setStats(statsData);
      setRecentClasses(classesData.slice(0, 4)); // Limiter à 4 classes
      setUpcomingTasks(tasksData.slice(0, 3)); // Limiter à 3 tâches
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard étudiant:', error);
      setError('Impossible de charger les données du dashboard');
      
      // Afficher des données de test si aucune donnée n'est disponible
      setStats({
        totalClasses: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalSubmissions: 0,
        recentActivity: []
      });
      setRecentClasses([]);
      setUpcomingTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = (days: number) => {
    if (days < 0) return 'En retard';
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Demain';
    if (days <= 7) return `Dans ${days} jours`;
    return `Dans ${days} jours`;
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
          <p className="text-gray-600 mt-2">Bienvenue, {user.nom} ! Voici un aperçu de vos cours.</p>
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
                <FaGraduationCap className="text-blue-600" />
                Mes cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalClasses}</div>
              <p className="text-sm text-gray-600">Cours inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaFileAlt className="text-purple-600" />
                Tâches totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
              <p className="text-sm text-gray-600">Devoirs assignés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Tâches terminées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-sm text-gray-600">Devoirs rendus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaClock className="text-orange-600" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</div>
              <p className="text-sm text-gray-600">À rendre</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cours récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mes cours</span>
                <Link to="/etudiant/cours">
                  <Button variant="outline" size="sm">
                    Voir tous
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Vos cours les plus actifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaGraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun cours inscrit</p>
                  <p className="text-sm">Rejoignez un cours pour commencer</p>
                  <Link to="/etudiant/cours">
                    <Button className="mt-4">
                      Rejoindre un cours
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentClasses.map((classe) => (
                    <div key={classe.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaBook className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{classe.nom}</h4>
                          <p className="text-sm text-gray-600">Prof: {classe.professeur_nom}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FaFileAlt className="text-gray-400" />
                            {classe.taches_count} tâche(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <FaBook className="text-gray-400" />
                            {classe.documents_count} doc(s)
                          </span>
                        </div>
                        <Link to={`/etudiant/classe/${classe.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Voir cours
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tâches à venir */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaClock />
                Tâches à venir
              </CardTitle>
              <CardDescription>
                Prochains devoirs à rendre
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaClock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune tâche à venir</p>
                  <p className="text-sm">Vous êtes à jour !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task) => {
                    const daysUntilDeadline = getDaysUntilDeadline(task.date_limite);
                    const statusColor = getStatusColor(daysUntilDeadline);
                    const statusText = getStatusText(daysUntilDeadline);
                    
                    return (
                      <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.titre}</h4>
                            <p className="text-sm text-gray-600">{task.classe_nom}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant={daysUntilDeadline < 0 ? "destructive" : "secondary"} className={statusColor}>
                              {statusText}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(task.date_limite).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link to={`/etudiant/soumettre`}>
                            <Button variant="outline" size="sm">
                              Soumettre
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaChartLine />
              Activité récente
            </CardTitle>
            <CardDescription>
              Vos dernières actions et soumissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle className="text-green-600 text-sm" />
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
                <p className="text-sm">Vos actions apparaîtront ici</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default EtudiantDashboard;
