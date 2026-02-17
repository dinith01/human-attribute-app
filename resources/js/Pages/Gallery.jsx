import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react'; // <--- Added useEffect & useRef

export default function Gallery({ auth, images, filters }) {
    
    // 1. Setup Form for Uploading
    const { data, setData, post, processing, errors, reset } = useForm({
        image: null,
    });

    // 2. Setup State for Filters
    // We initialize this with the data from the server so boxes stay filled
    const [values, setValues] = useState({
        hair_color: filters.hair_color || '',
        eye_color: filters.eye_color || '',
        tattoos: filters.tattoos === '1' || filters.tattoos === true,
        earrings: filters.earrings === '1' || filters.earrings === true,
    });

    // 3. THE FIX: Use 'useEffect' to Auto-Search when values change
    // This "Debounce" logic waits 500ms after you stop typing to send the request.
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the search on the very first load (let the page load normally)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(route('gallery'), values, {
                preserveState: true,  // Keep the input focus
                preserveScroll: true, // Don't jump to top
                replace: true         // Don't clutter browser history
            });
        }, 500); // <--- Wait 500ms

        return () => clearTimeout(timer); // Cleanup timer if user keeps typing
    }, [values]);


    // 4. Helper to update state immediately (so you can type fast)
    const handleChange = (key, value) => {
        setValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // 5. Submit Upload
    const submit = (e) => {
        e.preventDefault();
        post(route('images.store'), {
            onSuccess: () => reset('image'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">AI Gallery</h2>}
        >
            <Head title="Gallery" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- FILTER BAR --- */}
                    <div className="bg-gray-100 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        
                        {/* Hair Color Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hair Color</label>
                            <input
                                type="text"
                                placeholder="e.g. Black, Blonde"
                                value={values.hair_color}
                                onChange={(e) => handleChange('hair_color', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            />
                        </div>

                        {/* Eye Color Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Eye Color</label>
                            <input
                                type="text"
                                placeholder="e.g. Blue, Brown"
                                value={values.eye_color}
                                onChange={(e) => handleChange('eye_color', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                            />
                        </div>

                        {/* Tattoos Checkbox */}
                        <div className="flex items-center h-full pb-3">
                            <input
                                type="checkbox"
                                id="tattoos"
                                checked={values.tattoos}
                                onChange={(e) => handleChange('tattoos', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="tattoos" className="ml-2 block text-sm text-gray-900 select-none cursor-pointer">
                                Has Tattoos?
                            </label>
                        </div>

                        {/* Earrings Checkbox */}
                        <div className="flex items-center h-full pb-3">
                            <input
                                type="checkbox"
                                id="earrings"
                                checked={values.earrings}
                                onChange={(e) => handleChange('earrings', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="earrings" className="ml-2 block text-sm text-gray-900 select-none cursor-pointer">
                                Has Earrings?
                            </label>
                        </div>
                    </div>
                    {/* --- END FILTER BAR --- */}

                    {/* Upload Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                        <form onSubmit={submit} className="flex gap-4 items-center">
                            <input 
                                type="file" 
                                onChange={e => setData('image', e.target.files[0])}
                                className="border p-2 rounded"
                            />
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {processing ? 'Analyzing...' : 'Upload & Analyze'}
                            </button>
                        </form>
                        {errors.image && <div className="text-red-500 mt-2">{errors.image}</div>}
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {images.length > 0 ? (
                            images.map((img) => (
                                <div key={img.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-gray-200 rounded mb-4 overflow-hidden">
                                        <img 
                                            src={`/storage/${img.file_path}`} 
                                            alt="Uploaded" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-bold mb-2">Attributes:</h3>
                                    <ul className="text-sm text-gray-600">
                                        {img.attributes.map(attr => (
                                            <li key={attr.id} className="flex justify-between border-b py-1">
                                                <span className="text-gray-500">{attr.key}:</span>
                                                <span className="font-medium text-black">{attr.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-10">
                                No matching images found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}