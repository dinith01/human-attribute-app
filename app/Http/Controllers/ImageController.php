<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\ImageAttribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Jobs\AnalyzeImageJob;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5048',
         ]);

        // Save image to disk
        $path = $request->file('image')->store('uploads', 'public');

        // Save image record in DB
        $image = Image::create([
            'file_path' => $path
        ]);

        // 🔥 THIS LINE sends work to background
        AnalyzeImageJob::dispatch($image->id);

        return redirect()->back()->with('success', 'Image uploaded. Analysis started...');
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