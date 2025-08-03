import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../shared/layout';
import Swal from 'sweetalert2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Cours() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fade, setFade] = useState<'in' | 'out' | null>(null);
  const [code, setCode] = useState('');

  const etudiantId = JSON.parse(localStorage.getItem('user') || '{}').id;

  const fetchClasses = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/classes/etudiant/${etudiantId}`);
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Erreur de chargement des classes', err);
    }
  };

  const rejoindreClasse = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/classes/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etudiant_id: etudiantId, code })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Succès', data.message, 'success');
        setCode('');
        closeModal();
        fetchClasses();
      } else {
        Swal.fire('Erreur', data.message || 'Échec de l’inscription', 'error');
      }
    } catch (error) {
      Swal.fire('Erreur', 'Erreur de requête', 'error');
    }
  };

  const openModal = () => {
    setShowModal(true);
    setTimeout(() => setFade('in'), 10);
  };

  const closeModal = () => {
    setFade('out');
    setTimeout(() => {
      setShowModal(false);
      setFade(null);
    }, 300);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mes cours</h2>
          <button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Rejoindre une classe</button>
        </div>

        {showModal && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${fade === 'out' ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-white p-6 rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 ${fade === 'out' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
              <h3 className="text-lg font-semibold mb-4">Rejoindre une classe</h3>
              <input type="text" placeholder="Code de la classe" value={code} onChange={(e) => setCode(e.target.value)} className="border p-2 w-full rounded mb-4" />
              <div className="flex justify-end gap-2">
                <button onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Annuler</button>
                <button onClick={rejoindreClasse} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Valider</button>
              </div>
            </div>
          </div>
        )}

        <div>
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classe: any) => (
                <Card key={classe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{classe.nom}</CardTitle>
                    <CardDescription>
                      Code: {classe.code} • Année: {classe.annee}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/etudiant/classe/${classe.id}`}>
                      <Button className="w-full">
                        Voir les détails
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucune classe trouvée.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Cours;
