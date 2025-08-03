import { useState } from 'react';
import Swal from 'sweetalert2';
import schoolImage from '../../assets/school.jpg'; // image dans src/assets
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    role: 'etudiant',
    matricule: '',
    specialite: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie 🎉',
          timer: 2000,
          showConfirmButton: false
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (response.status === 409) {
        Swal.fire({ icon: 'warning', title: 'Email déjà utilisé' });
      } else {
        Swal.fire({ icon: 'error', title: 'Erreur à l\'inscription' });
      }
    } catch (err : any) {
      Swal.fire({ icon: 'error', title: 'Erreur de connexion', text: err.message || 'Impossible de contacter le serveur' });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100">
      {/* Formulaire à gauche */}
      <div className="flex items-center justify-center p-8">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Créer un compte</h2>
            <p className="text-gray-600 mt-2">Rejoignez notre plateforme éducative</p>
          </div>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative mb-4">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="mot_de_passe"
              placeholder="Mot de passe"
              value={form.mot_de_passe}
              onChange={handleChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative mb-4">
            {form.role === 'etudiant' ? (
              <FaGraduationCap className="absolute left-3 top-3 text-gray-400" />
            ) : (
              <FaChalkboardTeacher className="absolute left-3 top-3 text-gray-400" />
            )}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="etudiant">Étudiant</option>
              <option value="professeur">Professeur</option>
            </select>
          </div>

          {form.role === 'etudiant' && (
            <input
              type="text"
              name="matricule"
              placeholder="Matricule"
              value={form.matricule}
              onChange={handleChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
          )}

          {form.role === 'professeur' && (
            <input
              type="text"
              name="specialite"
              placeholder="Spécialité"
              value={form.specialite}
              onChange={handleChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaUserPlus />
            S'inscrire
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Déjà un compte ?</p>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-800 underline transition flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              Se connecter
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

export default RegisterPage;
