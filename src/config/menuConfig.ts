import { 
    FaHome, 
    FaGraduationCap, 
    FaUsers, 
    FaFileAlt,
    FaComments
} from 'react-icons/fa';

export interface MenuItem {
    path: string;
    label: string;
    icon: any;
    description: string;
}

export interface MenuConfig {
    [key: string]: MenuItem[];
}

export const menuConfig: MenuConfig = {
    etudiant: [
        {
            path: "/etudiant/dashboard",
            label: "Tableau de bord",
            icon: FaHome,
            description: "Vue d'ensemble de vos cours"
        },
        {
            path: "/etudiant/cours",
            label: "Mes cours",
            icon: FaGraduationCap,
            description: "Tous vos cours inscrits"
        },
        {
            path: "/etudiant/soumettre",
            label: "Soumettre un devoir",
            icon: FaFileAlt,
            description: "Rendre vos travaux"
        },
        {
            path: "/etudiant/messages",
            label: "Messages privés",
            icon: FaComments,
            description: "Conversations privées"
        },

    ],
    professeur: [
        {
            path: "/professeur/dashboard",
            label: "Tableau de bord",
            icon: FaHome,
            description: "Vue d'ensemble de vos classes"
        },
        {
            path: "/professeur/classes",
            label: "Mes classes",
            icon: FaUsers,
            description: "Gérer vos classes"
        },

        {
            path: "/professeur/messages",
            label: "Messages privés",
            icon: FaComments,
            description: "Conversations privées"
        }
    ]
}; 