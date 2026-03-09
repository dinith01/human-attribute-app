# Human Attribute Analysis App


This is a web application that leverages an external AI service to analyze images of people and extract biometric attributes. Users can upload images, which are then processed in the background. The extracted data, such as hair color, eye color, and the presence of tattoos, is stored and displayed in a filterable gallery.

The project is built with a modern tech stack, featuring a Laravel backend and a React-based frontend powered by Inertia.js.

## Features

*   **Secure User Authentication**: Standard registration, login, and profile management powered by Laravel Breeze.
*   **Asynchronous Image Analysis**: Users can upload images, which are added to a queue for background processing, ensuring a non-blocking user experience.
*   **AI-Powered Attribute Extraction**: Integrates with a Hugging Face Space hosting a BLIP model to analyze images and extract key human attributes.
*   **Dynamic Gallery**: A responsive gallery displays all analyzed images, with real-time status updates (Pending, Completed, Failed) as the background jobs complete. The gallery automatically polls for updates.
*   **Smart Attribute Badges**: Extracted attributes are displayed as styled, easy-to-read "smart badges" on each image card.
*   **Advanced Filtering**: The gallery can be searched and filtered by various attributes, including hair color, eye color, and the presence of tattoos or earrings, with results updated on the fly.

## Tech Stack

*   **Backend**: Laravel 12
*   **Frontend**: React, Inertia.js, Tailwind CSS
*   **Build Tool**: Vite
*   **Database**: SQLite (by default)
*   **Queue Management**: Laravel Queues (using the database driver)
*   **Development Environment**: Pre-configured with a concurrent-run script for server, queue, and log monitoring.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

*   PHP 8.2+
*   Composer
*   Node.js & npm

### 2. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dinith01/human-attribute-app.git
    cd human-attribute-app
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment file:**
    ```bash
    cp .env.example .env
    ```

5.  **Generate an application key:**
    ```bash
    php artisan key:generate
    ```
    
6.  **Configure `.env` file:**
    Ensure your `.env` file is configured correctly for your local environment. For a quick start, the default settings use SQLite, and the queue and session drivers are set to `database`.

    ```env
    DB_CONNECTION=sqlite
    
    SESSION_DRIVER=database
    QUEUE_CONNECTION=database
    CACHE_STORE=database
    ```

7.  **Create the SQLite database file:**
    ```bash
    touch database/database.sqlite
    ```

8.  **Run database migrations:**
    This will create all necessary tables for users, jobs, sessions, and the image gallery.
    ```bash
    php artisan migrate
    ```
    
9. **Build frontend assets:**
   ```bash
   npm run build
   ```

### 3. Running the Application

This project includes a convenient script to start all necessary services for development.

```bash
composer run dev
```

This command concurrently starts:
*   The Laravel web server (`php artisan serve`)
*   The Laravel queue worker (`php artisan queue:listen`)
*   The Laravel Pail log monitor (`php artisan pail`)
*   The Vite frontend server (`npm run dev`)

Once running, you can access the application at **http://127.0.0.1:8000**.

## How It Works

1.  A user uploads an image through the "Gallery" page.
2.  The `ImageController` validates and stores the image in `storage/app/public/uploads`.
3.  A new record is created in the `images` table with an `analysis_status` of `pending`.
4.  An `AnalyzeImageJob` is dispatched to the queue.
5.  The queue worker processes the job, retrieves the image file, and sends it to an external AI API (`https://dinith01-blip-api.hf.space/analyze`).
6.  The job waits for the AI's JSON response containing the extracted attributes.
7.  If the analysis is successful, the attributes are saved to the `image_attributes` table, and the image status is updated to `completed`.
8.  If the analysis fails (e.g., no person detected), the status is updated to `failed`.
9.  The frontend gallery periodically reloads data to display the latest status and attributes for any pending images.


## Testing

To run the application's test suite, use the following Artisan command:

```bash
php artisan test
```

The tests cover core functionalities including:
*   User authentication and registration.
*   Profile management.
*   Image upload and background job dispatching.
*   Database schema integrity and model relationships.