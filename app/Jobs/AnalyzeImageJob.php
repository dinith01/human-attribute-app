<?php

namespace App\Jobs;

use App\Models\Image;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AnalyzeImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $imageId;

    public function __construct(int $imageId)
    {
        $this->imageId = $imageId;
    }

    public function handle(): void
    {
        $image = Image::with('attributes')->find($this->imageId);
        if (!$image) return;

        // Read file
        $imageContent = Storage::disk('public')->get($image->file_path);

        // Call HF (timeouts + retry)
        $response = Http::retry(2, 1000)
            ->connectTimeout(5)
            ->timeout(90)
            ->attach('image', $imageContent, 'photo.jpg')
            ->post('https://dinith01-blip-api.hf.space/analyze');

        $data = $response->json();

        // If failed -> mark as failed (and optionally delete file)
        if ($response->failed() || (($data['status'] ?? '') === 'Failed')) {
            // Optional: store status in DB if you add a column
            // $image->update(['analysis_status' => 'failed']);

            // Or delete the image record + file:
            Storage::disk('public')->delete($image->file_path);
            $image->delete();

            return;
        }

        // Save attributes
        foreach ($data as $key => $value) {
            if (in_array($key, ['status', 'message'])) continue;

            $image->attributes()->create([
                'key' => $key,
                'value' => (string) $value,
            ]);
        }

        // Optional: mark as completed
        // $image->update(['analysis_status' => 'done']);
    }
}