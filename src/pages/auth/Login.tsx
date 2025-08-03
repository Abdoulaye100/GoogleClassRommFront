import { useState } from 'react';
import Swal from 'sweetalert2';
import schoolImage from '../../assets/school.jpg'; // image dans src/assets
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: motDePasse })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie 👋',
          text: `Bienvenue ${data.user.nom}`,
          timer: 2000,
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setTimeout(() => {
          if (data.user.role === 'professeur') {
            navigate('/professeur/dashboard');
          } else {
            navigate('/etudiant/dashboard');
          }
        }, 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: data.message || 'Email ou mot de passe incorrect'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur réseau',
        text: 'Impossible de contacter le serveur'
      });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
      
      {/* Formulaire à gauche */}
      <div className="flex items-center justify-center p-8">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="text-gray-600 mt-2">Bienvenue sur Google Classroom</p>
          </div>

          <div className="relative mb-4">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative mb-6">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            Se connecter
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Pas encore de compte ?</p>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 underline transition flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      {/* Image à droite */}
      <div className="hidden md:block">
        <img
          src={schoolImage}
          alt="Éducation"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default LoginPage;
