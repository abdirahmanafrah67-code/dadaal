import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { auth } from '../firebase/config';
import { FaPlus, FaClock, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import ConfirmDialog from '../components/Shared/ConfirmDialog';

const Dashboard = () => {
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [deleteDialogState, setDeleteDialogState] = useState({ isOpen: false, designId: null });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        // Check auth
        const unsubscribe = auth.onAuthStateChanged((u) => {
            if (u) {
                setUser(u);
                fetchDesigns(u.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchDesigns = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('designs')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setDesigns(data || []);
        } catch (error) {
            console.error('Error fetching designs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/editor');
    };

    const handleOpenDesign = (id) => {
        navigate(`/editor?id=${id}`);
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setDeleteDialogState({ isOpen: true, designId: id });
    };

    const handleConfirmDelete = async () => {
        const id = deleteDialogState.designId;
        if (!id) return;

        try {
            const { error } = await supabase
                .from('designs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setDesigns(designs.filter(d => d.id !== id));
        } catch (error) {
            console.error('Error deleting design:', error);
            alert('Failed to delete design');
        } finally {
            setDeleteDialogState({ isOpen: false, designId: null });
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
                        <p className="text-gray-500 mt-1">Manage and edit your creative projects</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="text-gray-500 hover:text-red-500 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-red-50 transition-all"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                        <button
                            onClick={handleCreateNew}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
                        >
                            <FaPlus /> New Design
                        </button>
                    </div>
                </div>

                {designs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <FaEdit className="text-4xl text-purple-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No designs yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md">Start your creative journey by creating your first design.</p>
                        <button
                            onClick={handleCreateNew}
                            className="bg-purple-50 text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                        >
                            Create First Design
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map((design) => (
                            <div
                                key={design.id}
                                onClick={() => handleOpenDesign(design.id)}
                                className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Preview */}
                                <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                                    {design.preview_url ? (
                                        <img
                                            src={design.preview_url}
                                            alt={design.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FaEdit className="text-4xl" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                                            Edit Design
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 truncate pr-4" title={design.name}>
                                            {design.name || 'Untitled Design'}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <FaClock size={10} />
                                            <span>{new Date(design.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteClick(e, design.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                                        title="Delete"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={deleteDialogState.isOpen}
                onClose={() => setDeleteDialogState({ isOpen: false, designId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Design?"
                message="Are you sure you want to delete this design? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Logout?"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                isDestructive={true}
            />
        </div>
    );
};

export default Dashboard;
