<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\ImageAttribute; // Make sure this is imported
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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
}