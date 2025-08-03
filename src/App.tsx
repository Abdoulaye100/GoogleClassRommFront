import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './pages/auth/Register';
import LoginPage from './pages/auth/Login';
import EtudiantDashboard from './pages/EtudiantsPages/EtudiantDashboard';
import EtudiantCours from './pages/EtudiantsPages/Cours';
import EtudiantClasseDetails from './pages/EtudiantsPages/ClasseDetails';
import EtudiantSoumettre from './pages/EtudiantsPages/Soumettre';
import EtudiantMessages from './pages/EtudiantsPages/Messages';
import ProfesseurMessages from './pages/ProfessseurPages/Messages';
import ProfDashboard from './pages/ProfessseurPages/ProfDashboard';
import ProfClasses from './pages/ProfessseurPages/ProfClasses';
import ClasseDetails from './pages/ProfessseurPages/ClasseDetails';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirection vers /register si on accède à / */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/etudiant/dashboard" element={<EtudiantDashboard />} />
        <Route path="/etudiant/cours" element={<EtudiantCours/>} />
        <Route path="/etudiant/classe/:id" element={<EtudiantClasseDetails />} />
        <Route path="/etudiant/soumettre" element={<EtudiantSoumettre />} />
        <Route path="/etudiant/messages" element={<EtudiantMessages />} />

        <Route path="/professeur/dashboard" element={<ProfDashboard />} />
        <Route path="/professeur/classes" element={<ProfClasses/>} />
        <Route path="/prof/classes/:id" element={<ClasseDetails />} />
        <Route path="/professeur/messages" element={<ProfesseurMessages />} />



      </Routes>
    </Router>
  );
}

export default App;
