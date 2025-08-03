import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { FaTrash } from "react-icons/fa";
import Swal from 'sweetalert2';


interface ListeDocumentsProps {
    classeId?: string;
}

const listeDocuments = forwardRef<any, ListeDocumentsProps>(({ classeId }, ref) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [documents, setDocuments] = useState([]);

    const fetchDocuments = async () => {
        try {
            const url = classeId 
                ? `http://localhost:3000/api/documents?classeId=${classeId}`
                : 'http://localhost:3000/api/documents';
            const response = await fetch(url);
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error('Erreur de chargement des documents', error);
        }
    };

    // Exposer fetchDocuments via ref
    useImperativeHandle(ref, () => ({
        fetchDocuments
    }));

    useEffect(() => {
        fetchDocuments();
    }, [classeId]);


    async function handleDelete(id: any): Promise<void> {
        try {

            Swal.fire({
                title: 'Êtes-vous sûr ?',
                text: "Cette action est irréversible !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await fetch('http://localhost:3000/api/documents/delete/'+id,{
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                    
                    const data = await response.json();
                    Swal.fire({
                        icon: 'success',
                        title: 'Document supprimé',
                        text: data.message,
                    });
                    fetchDocuments();
                }
            });

        } catch (error) {
            console.error('Erreur de chargement des documents', error);
        }
    }

    return (        
        <div className="p-4 hover:shadow mb-6">
            {documents.length > 0 ? (
                <ul className="flex gap-4 flex-wrap">
                    {documents.map((doc: any) => (
                        <li key={doc.id} className="border p-4 rounded shadow max-w-[300px] relative">
                            <div>    
                                {(user.role === 'professeur') && (
                                    <button className="absolute top-2 right-2 text-red-600 hover:text-red-800" onClick={() => handleDelete(doc.id)}>
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{doc.titre}</h3>
                                <p className="text-sm text-gray-600">{doc.description}</p>
                                <a href={doc.fichier} className="text-blue-600 hover:underline mt-2 inline-block" target="_blank" rel="noopener noreferrer">
                                    Voir le document
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600 mb-6">Aucun document partagé pour le moment.</p>
            )}
        </div>
    );


});

export default listeDocuments;