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
        $image = Image::find($this->imageId);
        if (!$image) return;

        $imageContent = Storage::disk('public')->get($image->file_path);

        $response = Http::retry(2, 1000)
            ->connectTimeout(5)
            ->timeout(90)
            ->attach('image', $imageContent, 'photo.jpg')
            ->post('https://dinith01-blip-api.hf.space/analyze');

        $data = $response->json();

        // If HF failed OR returned "Failed"
        if ($response->failed() || !is_array($data) || (($data['status'] ?? '') === 'Failed')) {

            // optional: delete file to save disk space
            // Storage::disk('public')->delete($image->file_path);

            $image->analysis_status = 'failed';
            $image->save();
            return;
        }

        foreach ($data as $key => $value) {
            if (in_array($key, ['status', 'message'])) continue;

            $image->attributes()->create([
                'key' => $key,
                'value' => (string) $value,
            ]);
        }

        $image->analysis_status = 'completed';
        $image->save();
    }


    
}