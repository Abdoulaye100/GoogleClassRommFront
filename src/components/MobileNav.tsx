import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, 
    FaGraduationCap, 
    FaTasks, 
    FaChartLine, 
    FaUsers, 
    FaFileAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';

function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const location = useLocation();

    if (!user || !user.role) {
        return null;
    }

    // Configuration des menus par rôle
    const menuConfig = {
        etudiant: [
            {
                path: "/etudiant/dashboard",
                label: "Tableau de bord",
                icon: FaHome
            },
            {
                path: "/etudiant/cours",
                label: "Mes cours",
                icon: FaGraduationCap
            },
            {
                path: "/etudiant/soumettre",
                label: "Soumettre un devoir",
                icon: FaFileAlt
            },
            {
                path: "/etudiant/avancement",
                label: "Avancement",
                icon: FaChartLine
            }
        ],
        professeur: [
            {
                path: "/professeur/dashboard",
                label: "Tableau de bord",
                icon: FaHome
            },
            {
                path: "/professeur/classes",
                label: "Mes classes",
                icon: FaUsers
            },
            {
                path: "/professeur/taches",
                label: "Tâches",
                icon: FaTasks
            },
            {
                path: "/professeur/avancement",
                label: "Suivi projets",
                icon: FaChartLine
            }
        ]
    };

    const currentMenu = menuConfig[user.role as keyof typeof menuConfig] || [];

    const isActiveRoute = (path: string) => {
        // Gestion spéciale pour les détails de classe
        if (path === "/professeur/classes" && location.pathname.startsWith("/prof/classes/")) {
            return true;
        }
        if (path === "/etudiant/cours" && location.pathname.startsWith("/etudiant/classe/")) {
            return true;
        }
        
        // Gestion standard
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="lg:hidden">
            {/* Bouton hamburger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            >
                {isOpen ? (
                    <FaTimes className="text-gray-600 text-lg" />
                ) : (
                    <FaBars className="text-gray-600 text-lg" />
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
            )}

            {/* Menu mobile */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <FaGraduationCap className="text-white text-lg" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Classroom++</h2>
                            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="p-4">
                    <div className="space-y-2">
                        {currentMenu.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = isActiveRoute(item.path);
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconComponent className="text-lg" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-600">
                                    {user.nom?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.nom}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MobileNav; 