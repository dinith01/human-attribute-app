<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;
use App\Models\Image;
use App\Models\ImageAttribute;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function database_has_expected_columns()
    {
        // 1. Check 'images' table columns
        $this->assertTrue(Schema::hasColumns('images', [
            'id', 'file_path', 'created_at', 'updated_at'
        ]));

        // 2. Check 'image_attributes' table columns
        $this->assertTrue(Schema::hasColumns('image_attributes', [
            'id', 'image_id', 'key', 'value', 'created_at', 'updated_at'
        ]));
    }

    /** @test */
    public function an_image_can_have_attributes()
    {
        // ARRANGE: Create an image
        $image = Image::create(['file_path' => 'uploads/photo1.jpg']);

        // ACT: Add an attribute to it
        $image->attributes()->create([
            'key' => 'Eye Color',
            'value' => 'Blue'
        ]);

        // ASSERT: Check if we can retrieve it
        $this->assertDatabaseHas('image_attributes', [
            'image_id' => $image->id,
            'key' => 'Eye Color',
            'value' => 'Blue'
        ]);
    }
}