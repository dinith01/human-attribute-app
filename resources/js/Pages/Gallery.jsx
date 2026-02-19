import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Gallery({ auth, images, filters }) {
    
    // --- 1. SETUP STATE & FORM ---
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null,
    });

    const [values, setValues] = useState({
        hair_color: filters.hair_color || '',
        eye_color: filters.eye_color || '',
        tattoos: filters.tattoos === '1' || filters.tattoos === true,
        earrings: filters.earrings === '1' || filters.earrings === true,
    });

    // --- 2. DEBOUNCED SEARCH LOGIC ---
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route('gallery'), values, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [values]);

    const handleChange = (key, value) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    // --- 3. UPLOAD SUBMIT ---
    const submit = (e) => {
        e.preventDefault();
        post(route('images.store'), {
            onSuccess: () => reset('image'),
        });
    };

    // --- HELPER: SMART BADGE RENDERER ---
    const renderAttributeBadge = (attr) => {
        const key = attr.key.toLowerCase();
        const value = attr.value.toLowerCase();

        // --- HIDE LOGIC ---
        // 1. Hide specifically "Body Type"
        if (key === 'body type') return null; 

        // 2. Hide "No" values (optional, keep if you want)
        if (value === 'no' || value === 'false') return null;
        // ------------------
        
        // Base Glass Style
        const baseStyle = "backdrop-blur-md border px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm";

        // 1. Handle Tattoos
        if (key.includes('tattoo') && (value === 'yes' || value === 'true')) {
            return (
                <span key={attr.id} className={`${baseStyle} bg-rose-500/20 border-rose-400/30 text-rose-100`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    Has Tattoos
                </span>
            );
        }

        // 2. Handle Earrings
        if (key.includes('earring') && (value === 'yes' || value === 'true')) {
            return (
                <span key={attr.id} className={`${baseStyle} bg-indigo-500/20 border-indigo-400/30 text-indigo-100`}>
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Earrings Detected
                </span>
            );
        }

        // 3. Handle Eye Color
        if (key.includes('eye')) {
            return (
                <span key={attr.id} className={`${baseStyle} bg-blue-500/10 border-blue-400/30 text-blue-50`}>
                    <svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {attr.value} Eyes
                </span>
            );
        }

        // 4. Handle Hair Color
        if (key.includes('hair')) {
            return (
                <span key={attr.id} className={`${baseStyle} bg-yellow-500/10 border-yellow-400/30 text-yellow-50`}>
                   <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
                   {attr.value} Hair
                </span>
            );
        }

        // 5. Default Fallback
        return (
            <span key={attr.id} className={`${baseStyle} bg-white/10 border-white/20 text-white`}>
                <span className="opacity-60 uppercase text-[10px] mr-1 tracking-wider">{attr.key}:</span>
                {attr.value}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Biometric Database</h2>}
        >
            <Head title="Gallery" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* SECTION 1: UPLOAD AREA */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl mb-10 p-8 border border-gray-100 relative">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">New Entry Analysis</h3>
                            <p className="text-gray-500 text-sm">Upload surveillance or profile image for AI extraction</p>
                        </div>

                        <form onSubmit={submit} className="max-w-xl mx-auto z-10 relative">
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all cursor-pointer group text-center">
                                <input 
                                    type="file" 
                                    onChange={e => setData('image', e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="space-y-3">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-100 transition-colors">
                                        <svg className="h-8 w-8 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="font-bold text-indigo-600">Click to upload</span> or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Supports High Res Images</p>
                                </div>
                            </div>

                            {data.image && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-700 font-medium bg-green-50 py-2 px-4 rounded-full w-fit mx-auto border border-green-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Ready: {data.image.name}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={processing || !data.image}
                                className="w-full mt-6 bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {processing ? 'Processing Biometrics...' : 'Run Analysis'}
                            </button>
                        </form>
                    </div>

                    {/* SECTION 2: FILTERS */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
                         <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Search Database
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hair Color</label>
                                <input type="text" placeholder="e.g. Brown" value={values.hair_color} onChange={(e) => handleChange('hair_color', e.target.value)} className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Eye Color</label>
                                <input type="text" placeholder="e.g. Blue" value={values.eye_color} onChange={(e) => handleChange('eye_color', e.target.value)} className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                            <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-200 cursor-pointer transition-all h-[42px]">
                                <input type="checkbox" checked={values.tattoos} onChange={(e) => handleChange('tattoos', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                <span className="text-sm font-medium text-gray-700">Has Tattoos</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-200 cursor-pointer transition-all h-[42px]">
                                <input type="checkbox" checked={values.earrings} onChange={(e) => handleChange('earrings', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                <span className="text-sm font-medium text-gray-700">Has Earrings</span>
                            </label>
                        </div>
                    </div>

                    {/* SECTION 3: GLASS OVERLAY GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.length > 0 ? (
                            images.map((img) => (
                                <div key={img.id} className="group relative h-[450px] w-full bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-800">
                                    
                                    {/* Background Image */}
                                    <img 
                                        src={`/storage/${img.file_path}`} 
                                        alt="Suspect" 
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                    />
                                    
                                    {/* Gradient Overlay (Dark at bottom for text readability) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>

                                    {/* Glass Overlay Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        
                                        {/* Header ID */}
                                        <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                                            <div>
                                                <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Subject ID</span>
                                                <span className="text-2xl font-mono text-white tracking-tighter">#{String(img.id).padStart(4, '0')}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Date Scanned</span>
                                                <span className="text-xs text-gray-300 font-mono">{new Date(img.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Smart Tags Area */}
                                        <div className="flex flex-wrap gap-2 content-start min-h-[60px]">
                                            {img.attributes.map(attr => renderAttributeBadge(attr))}
                                        </div>
                                    </div>
                                    
                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <div className="bg-gray-200 p-6 rounded-full mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
                                <p className="text-gray-500">Adjust your search parameters to find results.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}