import { useLocation } from 'react-router-dom';

export const useActiveRoute = () => {
    const location = useLocation();

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

    const getActiveClass = (path: string, activeClass: string, defaultClass: string) => {
        return isActiveRoute(path) ? activeClass : defaultClass;
    };

    const getActiveIconClass = (path: string, activeClass: string, defaultClass: string) => {
        return isActiveRoute(path) ? activeClass : defaultClass;
    };

    return {
        isActiveRoute,
        getActiveClass,
        getActiveIconClass,
        currentPath: location.pathname
    };
}; 