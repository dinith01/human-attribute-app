<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\Image;
use App\Models\User;

class ImageUploadTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_uploads_an_image_and_saves_ai_attributes()
    {
        // 1. ARRANGE
        Storage::fake('public');

        // Fake ANY request to the outside world
        Http::fake([
            '*' => Http::response([
                'Body Type' => 'Full Human Body',
                'Eye Color' => 'Blue',
                'Tattoos' => 'Yes'
            ], 200),
        ]);

        $file = UploadedFile::fake()->image('person.jpg');

        // 2. ACT

        $user = User::factory()->create();
        $response = $this->actingAs($user)->post('/images', [
        'image' => $file
    ]);

        // --- DEBUGGING ---
        // If this fails again, un-comment the line below to see the error message in your terminal
        // $response->dumpSession(); 

        // 3. ASSERT
        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        // Check Database
        $this->assertDatabaseCount('images', 1);
        
        // Get the saved image to find the real filename
        $image = Image::first();

        // Check File Exists
        Storage::disk('public')->assertExists($image->file_path);

        // Check Attributes
        $this->assertDatabaseHas('image_attributes', [
            'image_id' => $image->id,
            'key' => 'Eye Color',
            'value' => 'Blue'
        ]);
    }
}