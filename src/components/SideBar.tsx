import { Link } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';
import { useActiveRoute } from '../hooks/useActiveRoute';
import { menuConfig } from '../config/menuConfig';

function Sidebar() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.role) {
        return window.location.href = "/login";
    }

    const { isActiveRoute } = useActiveRoute();

    const currentMenu = menuConfig[user.role as keyof typeof menuConfig] || [];

    const getLinkClass = (path: string) => {
        const isActive = isActiveRoute(path);
        return `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
            isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-105' 
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900 hover:shadow-md'
        }`;
    };

    const getIconClass = (path: string) => {
        const isActive = isActiveRoute(path);
        return `text-lg transition-all duration-300 ${
            isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
        }`;
    };

    return (
        <div className="w-72 bg-white shadow-xl border-r border-gray-200 min-h-screen p-6 hidden lg:block">
            {/* Header de la sidebar */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FaGraduationCap className="text-white text-lg" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Classroom++</h2>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                    </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Menu principal */}
            <nav className="space-y-2">
                {currentMenu.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={getLinkClass(item.path)}
                            title={item.description}
                        >
                            <IconComponent className={getIconClass(item.path)} />
                            <div className="flex-1">
                                <span className="font-medium">{item.label}</span>
                                <p className="text-xs opacity-75 hidden group-hover:block">
                                    {item.description}
                                </p>
                            </div>
                            {isActiveRoute(item.path) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer de la sidebar */}
            <div className="absolute bottom-6 left-6 right-6 max-w-xs">
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
    );
}

export default Sidebar;
