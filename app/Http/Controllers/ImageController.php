<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\ImageAttribute; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5048',
        ]);

        // 2. Save file to disk
        $path = $request->file('image')->store('uploads', 'public');

        // --- THE FIX IS HERE ---
        // We use Storage::disk to read the file. This works for Tests AND Real usage.
        $imageContent = Storage::disk('public')->get($path);
        
        // 3. Send to API
        $response = Http::attach(
            'image', $imageContent, 'photo.jpg'
        )->post('https://dinith01-blip-api.hf.space/analyze');

        // 4. Human Check Logic
        // If the API crashes OR explicitly says "Failed", we reject it.
        if ($response->failed() || ($response->json()['status'] ?? '') === 'Failed') {
            Storage::disk('public')->delete($path);
            return back()->withErrors(['image' => 'Not a human body or API failed.']);
        }

        // 5. Save Image to DB
        $image = Image::create([
            'file_path' => $path
        ]);

        // 6. Save Attributes
        $attributes = $response->json();
        foreach ($attributes as $key => $value) {
            // Ignore system keys
            if (in_array($key, ['status', 'message'])) continue;

            $image->attributes()->create([
                'key' => $key,
                'value' => (string) $value // Cast to string to be safe
            ]);
        }

        return redirect()->back()->with('success', 'Image analyzed and saved!');
    }

public function index(Request $request)
{
    $query = Image::with('attributes')->latest();

    // 1. Filter by Hair Color (Typing)
    if ($request->filled('hair_color')) {
        $query->whereHas('attributes', function ($q) use ($request) {
            $q->where('key', 'Hair Color')
              ->where('value', 'like', '%' . $request->hair_color . '%');
        });
    }

    // 2. Filter by Eye Color (Typing)
    if ($request->filled('eye_color')) {
        $query->whereHas('attributes', function ($q) use ($request) {
            $q->where('key', 'Eye Color')
              ->where('value', 'like', '%' . $request->eye_color . '%');
        });
    }

    // 3. Filter by Tattoos (Checkbox: Only show if "Yes")
    if ($request->boolean('tattoos')) {
        $query->whereHas('attributes', function ($q) {
            $q->where('key', 'Tattoos')->where('value', 'Yes');
        });
    }

    // 4. Filter by Earrings (Checkbox: Only show if "Yes")
    if ($request->boolean('earrings')) {
        $query->whereHas('attributes', function ($q) {
            $q->where('key', 'Earrings')->where('value', 'Yes');
        });
    }

    return Inertia::render('Gallery', [
        'images' => $query->get(),
        // Send filters back so the boxes stay filled after reload
        'filters' => $request->only(['hair_color', 'eye_color', 'tattoos', 'earrings'])
    ]);
}

}