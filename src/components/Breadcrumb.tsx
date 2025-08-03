import { useLocation, Link } from 'react-router-dom';
import { FaHome, FaChevronRight, FaGraduationCap, FaUsers, FaTasks, FaChartLine, FaFileAlt } from 'react-icons/fa';

function Breadcrumb() {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const getBreadcrumbItems = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);
        const items = [];

        // Ajouter l'accueil
        items.push({
            label: 'Accueil',
            path: `/${user.role}/dashboard`,
            icon: FaHome
        });

        // Analyser les segments du chemin
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const isLast = i === pathSegments.length - 1;

            // Gestion spéciale pour les détails de classe
            if (segment === 'classe' && pathSegments[i + 1]) {
                items.push({
                    label: 'Détails de la classe',
                    path: location.pathname,
                    icon: FaGraduationCap,
                    isLast: true
                });
                break;
            }

            // Gestion spéciale pour les détails de classe (professeur)
            if (segment === 'prof' && pathSegments[i + 1] === 'classes' && pathSegments[i + 2]) {
                items.push({
                    label: 'Mes classes',
                    path: '/professeur/classes',
                    icon: FaUsers
                });
                items.push({
                    label: 'Détails de la classe',
                    path: location.pathname,
                    icon: FaGraduationCap,
                    isLast: true
                });
                break;
            }

            // Mapping des segments vers des labels lisibles
            const segmentLabels: { [key: string]: string } = {
                'etudiant': 'Étudiant',
                'professeur': 'Professeur',
                'prof': 'Professeur',
                'dashboard': 'Tableau de bord',
                'cours': 'Mes cours',
                'classes': 'Mes classes',
                'taches': 'Tâches',
                'avancement': 'Avancement',
                'soumettre': 'Soumettre un devoir',
                'messages': 'Messages privés'
            };

            const label = segmentLabels[segment] || segment;
            
            // Ne pas créer de lien pour les rôles (etudiant, professeur, prof)
            const isRole = ['etudiant', 'professeur', 'prof'].includes(segment);
            const path = isRole ? null : '/' + pathSegments.slice(0, i + 1).join('/');

            // Icônes par segment
            const getIcon = (seg: string) => {
                const iconMap: { [key: string]: any } = {
                    'dashboard': FaHome,
                    'cours': FaGraduationCap,
                    'classes': FaUsers,
                    'taches': FaTasks,
                    'avancement': FaChartLine,
                    'soumettre': FaFileAlt,
                    'messages': FaFileAlt
                };
                return iconMap[seg] || null;
            };

            items.push({
                label,
                path,
                icon: getIcon(segment),
                isLast: isLast || isRole
            });
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems();

    if (breadcrumbItems.length <= 1) {
        return null; // Ne pas afficher le breadcrumb si on est juste sur le dashboard
    }

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            {breadcrumbItems.map((item, index) => {
                const IconComponent = item.icon;
                
                return (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <FaChevronRight className="mx-2 text-gray-400" />
                        )}
                        
                        {item.isLast || !item.path ? (
                            <span className="flex items-center gap-2 text-gray-900 font-medium">
                                {IconComponent && <IconComponent className="text-gray-500" />}
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                            >
                                {IconComponent && <IconComponent />}
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

export default Breadcrumb; 