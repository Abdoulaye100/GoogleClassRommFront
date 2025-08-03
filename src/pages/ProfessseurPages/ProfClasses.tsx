import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Layout from '../shared/layout';
import { FaTrash, FaEdit, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


function ProfClasses() {
    const [classes, setClasses] = useState<any[]>([]);
    const [nom, setNom] = useState('');
    const [annee, setAnnee] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [fade, setFade] = useState<'in' | 'out' | null>(null);
    const profId = JSON.parse(localStorage.getItem('user') || '{}').id;
    
    const navigate = useNavigate();
    const generateCode = () => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return code;
    };

    const fetchElevesCount = async (classeId: number): Promise<number> => {
        const res = await fetch(`http://localhost:3000/api/classes/${classeId}/eleves-count`);
        const data = await res.json();
        return data.nb_eleves || 0;
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/classes/prof/${profId}`);
            const data = await response.json();

            // Ajoute nb_eleves pour chaque classe
            const classesWithCounts = await Promise.all(
            data.map(async (classe: any) => {
                const nb_eleves = await fetchElevesCount(classe.id);
                return { ...classe, nb_eleves };
            })
            );

            setClasses(classesWithCounts);
        } catch (err) {
        console.error('Erreur lors du chargement des classes', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = generateCode();
        try {
        const url = editId ? `http://localhost:3000/api/classes/${editId}` : 'http://localhost:3000/api/classes';
        const method = editId ? 'PUT' : 'POST';
        const body = editId ? { nom, annee } : { nom, code, annee, prof_id: profId };

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire('Succès', data.message, 'success');
            setNom(''); setAnnee(''); setEditId(null);
            setFade('out');
            setTimeout(() => {
            setShowModal(false);
            setFade(null);
            }, 300);
            fetchClasses();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de l\'enregistrement', 'error');
        }
        } catch (error) {
        Swal.fire('Erreur', 'Erreur de requête', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
        title: 'Confirmer la suppression',
        text: 'Voulez-vous vraiment supprimer cette classe ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        });

        if (confirm.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/classes/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok) {
            Swal.fire('Supprimé', data.message, 'success');
            fetchClasses();
            } else {
            Swal.fire('Erreur', data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
        }
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const openModal = (classe: any = null) => {
        if (classe) {
        setNom(classe.nom);
        setAnnee(classe.annee);
        setEditId(classe.id);
        } else {
        setNom('');
        setAnnee('');
        setEditId(null);
        }
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

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Mes classes</h2>
                <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Ajouter une classe</button>
                </div>

                {showModal && (
                <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${fade === 'out' ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`bg-white p-6 rounded-xl shadow-lg w-full max-w-md transform transition-all duration-300 ${fade === 'out' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                    <h3 className="text-lg font-semibold mb-4">{editId ? 'Modifier la classe' : 'Nouvelle classe'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Nom de la classe" value={nom} onChange={(e) => setNom(e.target.value)} className="border p-2 w-full rounded" />
                        <input type="text" placeholder="Année scolaire" value={annee} onChange={(e) => setAnnee(e.target.value)} className="border p-2 w-full rounded" />
                        <div className="flex justify-end gap-2">
                        <button type="button" onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Annuler</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editId ? 'Modifier' : 'Créer'}</button>
                        </div>
                    </form>
                    </div>
                </div>
                )}

                <div>
                    {classes.length > 0 ? (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((classe: any) => (
                            <li key={classe.id} className="relative border p-4 rounded-xl cursor-pointer bg-white shadow hover:shadow-lg transition-all">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button onClick={() => openModal(classe)} className="text-blue-600 hover:text-blue-800">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(classe.id)} className="text-red-600 hover:text-red-800">
                                        <FaTrash />
                                    </button>
                                </div>
                                <div onClick={() => navigate(`/prof/classes/${classe.id}`)}>
                                    <h3 className="text-lg font-semibold">{classe.nom}</h3>
                                    <p className="text-sm text-gray-600">Code : {classe.code}</p>
                                    <p className="text-sm text-gray-600">Année : {classe.annee}</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                                        <FaUserGraduate className="text-blue-500" />
                                        <span>{classe.nb_eleves || 0} élève(s)</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p>Aucune classe trouvée.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default ProfClasses;
