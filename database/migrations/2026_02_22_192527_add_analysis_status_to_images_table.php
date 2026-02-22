<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('images', function ($table) {
        $table->string('analysis_status')->default('pending');
    });
}

public function down(): void
{
    Schema::table('images', function ($table) {
        $table->dropColumn('analysis_status');
    });
}
};
