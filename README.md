# Implementasi Algoritma Machine Learning pada Sistem Rekomendasi Film Berbasis Website Interaktif - Moodflix 

    Blom diisi nih ges summary projectnya tolong

## Tools

    1. Google Colab
    2. Visual Studio Code
    3. Postman
    4. Railway Station

## Dataset

    Dataset yang digunakan dalam proyek ini diperoleh dari TMDB (The Movie Database) melalui proses web scraping. Dataset terdiri dari 15.000 baris dan 6 kolom, dan dapat diakses melalui tautan GitHub publik berikut:

**https://raw.githubusercontent.com/ilyasbrhm/Dataset/refs/heads/main/tmdb_dataset.csv**

**Fitur Dataset:**

    1. title: Judul film
    2. genres: Daftar genre film
    3. rating: Rating (0–10)
    4. popularity: Skor popularitas dari TMDB
    5. release_year: Tahun rilis
    6. poster_url: Tautan gambar poster film

## Pipeline ML

### 1. Import Libraries

Pastikan semua library telah terinstal. Jalankan perintah di bawah ini untuk instalasi **(jika belum)**:

```bash
!pip install numpy pandas seaborn matplotlib scikit-learn tensorflow
``` 

**Libraries yang digunakan:**

```bash
import numpy as np
import pandas as pd
from collections import Counter
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from sklearn.metrics import classification_report, confusion_matrix
import pickle
```

### 2. Exploratory Data Analysis (EDA)

Tahap ini bertujuan untuk memahami struktur, isi, dan kualitas data.

**a. Data Exploration:**

    - Menampilkan 5 baris pertama
    - Melihat jumlah baris dan kolom 
    - Memeriksa tipe data 
    - Menambahkan kolom id (jika belum ada)

**b. Data Cleaning:**

    - Memeriksa data yang hilang (missing values)
    - Menghapus entri dengan nilai kosong 
    - Menghapus data duplikat
    - Membersihkan dan memformat kolom genres yang awalnya berbentuk string yang menyerupai list dikonversi menjadi list Python asli.
    - Mengekstrak dan menghitung kemunculan setiap genre
    - Reset indeks dataframe hasil pembersihan

    Output dari tahap ini adalah DataFrame yang sudah dibersihkan (df_cleaned).

**c. Visualization (opsional)**

    - Mengevaluasi sebaran rating film
    - Melihat tren jumlah film berdasarkan tahun rilis
    - Mengidentifikasi genre paling umum
    - Meninjau hubungan antara rating dan popularitas

**Perlu dicatat bahwa beberapa langkah dalam tahap EDA dapat disesuaikan berdasarkan jenis dan struktur dataset yang digunakan.**

### 3. Data Preparation

Tahap ini bertujuan untuk menyiapkan data yang sudah dibersihkan sebelum digunakan dalam proses pelatihan model.

    - Mapping Mood Berdasarkan Genre: Memberikan label target yang lebih bermakna, dilakukan pemetaan genre film ke dalam kategori mood atau suasana film.
    - Multilabel Binarization (One-Hot Encoding Genre): Karena setiap film bisa memiliki lebih dari satu genre, digunakan MultiLabelBinarizer untuk mengubah daftar genre menjadi bentuk biner yang dapat digunakan sebagai fitur numerik.
    - Feature Engineering: Fitur akhir yang digunakan dalam model merupakan gabungan dari fitur numerik (release_year, popularity, rating) dan hasil one-hot encoding dari genre
    - Standardization: Fitur numerik dinormalisasi menggunakan StandardScaler agar berada pada skala yang seragam:
    - Label Encoding Mengonversi target mood yang masih berupa kategori (string) menjadi bentuk numerik.
    - One Hot Encoding untuk Target (mood): Mengubah angka hasil Label Encoding menjadi vektor biner.
    - Data Splitting: Dataset dibagi menjadi data latih dan data uji dengan rasio 80:20.

**Beberapa proses pada tahap ini juga bisa bervariasi tergantung pada struktur dataset yang digunakan dan tujuan proyek masing-masing.**

### 4. Modelling

Model yang digunakan adalah Artificial Neural Network (ANN) menggunakan arsitektur Sequential dari TensorFlow/Keras.

**a. Struktur Model:**

![Screenshot 2025-06-10 125644](https://github.com/user-attachments/assets/61edcaf6-cfab-4bfe-9897-efd68a99bd67)

    - Dense(128, activation='relu') → Layer 1 (Hidden Layer 1)
    - Dropout(0.3) → Layer 2 (Dropout Layer)
    - Dense(64, activation='relu') → Layer 3 (Hidden Layer 2)
    - Dense(output, activation='softmax') → Layer 4 (Output Layer)

**b. Kompilasi Model:**

![Screenshot 2025-06-10 125801](https://github.com/user-attachments/assets/79edcbea-76a6-44fd-b728-13447ff62dca)

    - Optimizer: adam
    - Loss Function: categorical_crossentropy
    - Metrik Evaluasi: accuracy

**c. Proses Training Model:**   

![Screenshot 2025-06-10 125842](https://github.com/user-attachments/assets/78f44440-42b7-487f-a70f-fcc7df814652)

    - Epochs: 20
    - Batch Size: 32
    - Validation Split: 0.2

**d. Cara Kerja Model:**

    Model ini bekerja dengan memprediksi mood film berdasarkan kombinasi fitur numerikal seperti tahun rilis, rating, dan popularitas, serta fitur kategorikal berupa genre yang telah diubah menjadi bentuk one-hot encoding. Genre film terlebih dahulu dipetakan ke dalam kategori mood (seperti "Action" menjadi "Energetic"), yang kemudian diencoding menjadi label numerik dan one-hot vector. Seluruh fitur diskalakan menggunakan standardisasi sebelum dimasukkan ke dalam model neural network berarsitektur multilayer dengan aktivasi ReLU dan softmax pada output. Model dilatih menggunakan categorical crossentropy dan Adam optimizer, serta dievaluasi berdasarkan akurasi pada data validasi.

**e. Alasan memilih Model ini:**
    
    - Fleksibel terhadap Berbagai Jenis Fitur: ANN mampu mengolah fitur numerik maupun kategori dan menemukan pola kompleks di antaranya, termasuk korelasi non-linear.
    - Mendukung Klasifikasi Multi-Kelas: Arsitektur softmax pada output layer menjadikan ANN sangat cocok untuk kasus klasifikasi dengan lebih dari dua kelas (seperti mood: emotional, cheerful, reflective, dll).
    - Menghasilkan Akurasi yang Tinggi: Dengan jumlah layer dan neuron yang memadai, ANN dapat mengungguli model klasik lainnya, terutama untuk dataset yang besar dan kompleks.
    - Daya Generalisasi Tinggi: Dengan teknik seperti dropout dan penggunaan validation set, model ANN lebih tahan terhadap overfitting dan mampu memberikan prediksi yang lebih akurat pada data baru yang belum pernah dilihat.

**Perlu diingat bahwa tahapan modelling dapat berbeda-beda tergantung preferensi, tujuan, dan pendekatan dari masing-masing proyek yang dikembangkan. Pemilihan model, struktur arsitektur, parameter training, hingga metrik evaluasi bisa disesuaikan dengan karakteristik data, kebutuhan akurasi, serta kompleksitas masalah yang dihadapi.**

### 5. Evaluation

Pada tahap ini, dilakukan evaluasi terhadap performa model yang telah dibuat. Beberapa metrik yang digunakan, yaitu:

    - Akurasi pada data uji (testing accuracy) untuk mengukur seberapa baik model memprediksi label pada data yang belum pernah dilihat sebelumnya.
    - Classification report yang mencakup metrik precision, recall, dan F1-score untuk masing-masing kelas.
    - Confusion matrix untuk memberikan gambaran visual mengenai jumlah prediksi yang benar dan salah dari setiap kelas.

## Output ML

Adapun output yang dihasilkan dan disimpan dari pipeline Machine Learning dalam proyek ini:
    
    - dataset_fix.csv = Dataset bersih (df_cleaned).
    - scaler.pkl = Menyimpan objek scaler untuk standarisasi fitur input.
    - label_encoder.pkl	= Encoder untuk mengubah label kategori (single label) jadi numerik.
    - mlb.pkl = Encoder multi-label untuk label dengan lebih dari satu kelas.
    - sistem_rekomendasi_model.h5	Model neural network hasil pelatihan, berisi arsitektur & bobot.

## Pipeline Backend
### Arsitektur Sistem Backend

Sistem backend MoodFlix terdiri dari dua server terintegrasi yang bekerja sama untuk menyediakan layanan rekomendasi film berbasis Machine Learning:

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │───▶│  Main API Server │
│   (Client)      │    │    (HAPI.js)     │
└─────────────────┘    └──────────┬───────┘
                                  │
                                  ▼
                       ┌──────────────────┐
                       │   ML API Server  │
                       │    (Flask)       │
                       └──────────────────┘
```

**Main API Server (HAPI.js) - Port 3000:**
- Menangani autentikasi pengguna menggunakan JWT
- Menyediakan endpoint utama untuk aplikasi frontend
- Mengelola sistem komentar dan interaksi pengguna
- Berkomunikasi dengan ML API Server untuk mendapatkan rekomendasi
- Menyimpan data pengguna dan komentar dalam format JSON

**ML API Server (Flask) - Port 5000:**
- Memuat dan menjalankan model Machine Learning terlatih (.h5)
- Menggunakan preprocessing objects (scaler.pkl, mlb.pkl, label_encoder.pkl)
- Menyediakan endpoint untuk prediksi rekomendasi film
- Memproses dataset film (dataset_fix.csv) untuk informasi detail
- Melakukan inference menggunakan model neural network

### Fitur Backend System

#### Main API Server Features:

1. **Sistem Autentikasi**
   - Registrasi pengguna baru
   - Login dengan username/password
   - JWT token generation dan validasi
   - Middleware autentikasi untuk protected routes

2. **Rekomendasi Film**
   - Endpoint untuk mendapatkan rekomendasi berdasarkan mood
   - Integrasi dengan ML API Server
   - Pemrosesan response dari model ML
   - Formatting data untuk frontend consumption

3. **Manajemen Komentar**
   - Komentar umum dan spesifik per film
   - CRUD operations (Create, Read, Update, Delete)
   - Validasi kepemilikan komentar
   - Timestamp dan metadata komentar

4. **Detail Film**
   - Endpoint untuk informasi detail film
   - Integrasi dengan data dari ML server
   - Metadata film dari dataset

#### ML API Server Features:

1. **Model Inference**
   - Load model TensorFlow dari file .h5
   - Preprocessing input sesuai training pipeline
   - Prediksi mood-based recommendations
   - Post-processing hasil prediksi

2. **Data Management**
   - Load dan serve dataset film
   - Filtering berdasarkan kriteria tertentu
   - Mapping ID film dengan informasi detail
   - Genre dan mood categorization

3. **API Endpoints**
   - `/predict` - Prediksi rekomendasi
   - `/moods` - Daftar mood tersedia
   - `/genres` - Daftar genre film
   - `/movie/<id>` - Detail film spesifik

### Tech Stack Backend

#### Main API Server Stack:
```json
{
  "framework": "HAPI.js v21.4.0",
  "authentication": "JWT (jsonwebtoken)",
  "validation": "Joi schema validation",
  "password_hashing": "bcrypt",
  "http_client": "axios",
  "storage": "File-based JSON (development)",
  "environment": "Node.js v14+"
}
```

#### ML API Server Stack:
```json
{
  "framework": "Flask",
  "ml_framework": "TensorFlow/Keras",
  "data_processing": ["pandas", "numpy"],
  "preprocessing": "scikit-learn",
  "model_serialization": "pickle",
  "environment": "Python v3.10.0"
}
```

### 📋 Prerequisites Backend

**System Requirements:**
- Node.js v14 atau lebih tinggi
- Python v3.10.0
- npm atau yarn package manager
- pip Python package manager

**Required ML Artifacts:**
- `sistem_rekomendasi_model.h5` (trained model)
- `scaler.pkl` (feature scaler)
- `mlb.pkl` (multi-label binarizer)
- `label_encoder.pkl` (mood label encoder)
- `dataset_fix.csv` (clean dataset)

### Setup dan Instalasi Backend

#### Langkah 1: Persiapan Environment

```bash
# Clone repository
git clone <repository-url>
cd moodflix-backend

# Struktur direktori yang diharapkan:
# ├── main-api/          # HAPI.js server
# ├── ml-api/            # Flask ML server  
# └── README.md
```

#### Langkah 2: Setup ML API Server (Jalankan Terlebih Dahulu)

```bash
# Masuk ke direktori ML API
cd ml-api

# Buat Python virtual environment
python -m venv venv

# Aktivasi virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt:**
```txt
Flask==2.3.2
tensorflow==2.13.0
pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
gunicorn==21.2.0
```
#### Langkah 3: Persiapkan ML Model Files

Pastikan struktur direktori ML API sebagai berikut:

```
ml-api/
├── model/
│   ├── sistem_rekomendasi_model.h5    # Model terlatih
│   ├── scaler.pkl                     # Feature scaler
│   ├── mlb.pkl                        # Multi-label binarizer  
│   ├── label_encoder.pkl              # Label encoder
│   └── dataset_fix.csv               # Dataset bersih
├── ml_server.py                       # Flask application
├── requirements.txt
└── venv/
```

#### Langkah 4: Jalankan ML Server

```bash
# Development mode
python ml_server.py

# Production mode dengan Gunicorn
gunicorn ml_server:app --bind 0.0.0.0:5000 --workers 2
```

**ML Server akan aktif di `http://localhost:5000`**

#### Langkah 5: Setup Main API Server

Buka terminal baru (biarkan ML server berjalan):

```bash
# Pindah ke direktori main API
cd main-api

# Install Node.js dependencies
npm install

# Setup development data
npm run setup
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "@hapi/hapi": "^21.4.0",
    "@hapi/jwt": "^3.2.0",
    "axios": "^1.4.0",
    "bcrypt": "^5.1.0",
    "joi": "^17.9.2"
  }
}
```

#### Langkah 6: Konfigurasi Environment

Buat file `.env` di direktori `main-api/`:

```env
PORT=3000
JWT_SECRET=moodflix-secret-key-2024
ML_SERVER_URL=http://localhost:5000
NODE_ENV=development
```

#### Langkah 7: Jalankan Main API Server

```bash
# Jalankan server
npm start

# Atau untuk development dengan auto-reload
npm run dev
```

**Main API Server akan aktif di `http://localhost:3000`**

### API Documentation

#### Main API Endpoints (Port 3000)

**Authentication Endpoints:**

```http
# User Registration
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}

# User Login
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe", 
  "password": "securepassword123"
}

# Get User Profile
GET /auth/user
Authorization: Bearer <jwt_token>
```

**Movie Recommendation Endpoints:**

```http
# Get Available Moods
GET /moods

Response:
{
  "status": "success",
  "data": {
    "moods": ["cheerful", "emotional", "reflective", "energetic"]
  }
}

# Advanced Movie Recommendations
POST /recommend/advanced
Content-Type: application/json

{
  "mood": "cheerful",
  "top_k": 5
}

Response:
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "id": 123,
        "title": "The Grand Budapest Hotel",
        "genres": ["Comedy", "Adventure"],
        "rating": 8.1,
        "year": 2014,
        "poster_url": "https://..."
      }
    ]
  }
}

# Get Movie Details
GET /movie/{movieId}
Authorization: Bearer <jwt_token>
```

**Comment System Endpoints:**

```http
# Get All Comments
GET /comments

# Get Movie-Specific Comments  
GET /comments/movie/{movieId}

# Add General Comment
POST /comments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "Great movie recommendation system!"
}

# Add Movie Comment
POST /comments/movie/{movieId}  
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "Amazing film! Loved every moment.",
  "movieTitle": "Inception"
}

# Update Comment
PUT /comments/general/{commentId}
PUT /comments/movie/{commentId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "Updated comment text"
}

# Delete Comment
DELETE /comments/{commentId}
Authorization: Bearer <jwt_token>

# Get Latest Comments
GET /comments/latest?limit=10
```

#### ML API Endpoints (Port 5000)

```http
# Movie Prediction
POST /predict
Content-Type: application/json

{
  "mood": "Happy",
  "top_k": 5
}

Response:
{
  "status": "success",
  "predictions": [
    {
      "movie_id": 123,
      "title": "The Pursuit of Happyness", 
      "confidence": 0.92,
      "genres": ["Drama", "Biography"],
      "rating": 8.0
    }
  ]
}

# Available Moods
GET /moods

# Available Genres
GET /genres  

# Movie Details
GET /movie/<movie_id>
```

### Testing Backend System

#### Testing ML API Server:

```bash
# Test model prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"mood":"Happy","top_k":3}'

# Test available moods
curl http://localhost:5000/moods

# Test movie details
curl http://localhost:5000/movie/123
```

#### Testing Main API Server:

```bash
# Test user registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123"}'

# Test login and get token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' | jq -r '.data.token')

# Test recommendation with token
curl -X POST http://localhost:3000/recommend/advanced \
  -H "Content-Type: application/json" \
  -d '{"mood":"cheerful","top_k":5}'

# Test adding comment
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great recommendation system!"}'
```

#### Integration Testing:

```bash
# Test complete flow: register → login → get recommendations → add comment
./test-integration.sh
```

### Struktur Proyek Backend

```
moodflix-backend/
├── main-api/                         # Main HAPI.js Server
│   ├── data/                         # JSON data storage
│   │   ├── users.json               # User data
│   │   └── comments.json            # Comments data
│   ├── routes/                      # API route definitions
│   │   ├── auth-route.js           # Authentication routes
│   │   ├── comment-route.js        # Comment management
│   │   ├── advanced-recommend-route.js  # Recommendation routes
│   │   ├── get-moods-route.js      # Moods endpoints
│   │   └── get-movie-detail-route.js   # Movie details
│   ├── services/                    # Business logic layer
│   │   ├── auth-service.js         # Auth business logic
│   │   ├── comment-service.js      # Comment operations
│   │   ├── ml-service.js           # ML API communication
│   │   ├── advanced-recommend-service.js  # Recommendation logic
│   │   ├── moods-service.js        # Moods management
│   │   └── movie-detail-service.js # Movie details service
│   ├── utils/                       # Utility functions
│   │   └── helpers.js              # Common helper functions
│   ├── scripts/                     # Setup and utility scripts
│   │   └── setup-dev-data.js       # Development data setup
│   ├── server.js                    # Main server entry point
│   ├── package.json                 # Node.js dependencies
│   └── .env                         # Environment variables
│
├── ml-api/                          # Flask ML Server
│   ├── model/                       # ML model and data files
│   │   ├── sistem_rekomendasi_model.h5  # Trained ML model
│   │   ├── scaler.pkl               # Feature scaler
│   │   ├── mlb.pkl                  # Multi-label binarizer
│   │   ├── label_encoder.pkl        # Label encoder
│   │   └── dataset_fix.csv          # Clean dataset
│   ├── ml_server.py                 # Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── Procfile                     # Deployment configuration
│   ├── runtime.txt                  # Python version specification
│   └── venv/                        # Python virtual environment
│
└── README.md                        # Project documentation
```

### Deployment Backend (Railway)

#### Prerequisites Deployment:
- Akun Railway (daftar di [railway.app](https://railway.app))
- GitHub repository dengan kode backend
- Railway CLI (opsional, bisa langsung dari web dashboard)

#### ML API Server Deployment (Railway):

**Deploy from GitHub Repository**

1. **Login ke Railway Dashboard**
   - Kunjungi [railway.app](https://railway.app) dan login dengan GitHub
   - Klik "New Project"

2. **Connect GitHub Repository**
   - Pilih "Deploy from GitHub repo"
   - Authorize Railway untuk akses GitHub repos
   - Select repository yang berisi ml-api folder
   - Railway akan otomatis detect Python project

3. **Configure Root Directory**
   - Di Railway dashboard, masuk ke Settings
   - Set "Root Directory" ke `ml-api/` 
   - Ini penting karena ML API ada di subfolder

4. **Configure Environment Variables**
   Di Railway dashboard Variables tab, tambahkan:
   ```env
   FLASK_ENV=production
   PORT=5000
   PYTHONPATH=/app
   ```

5. **Setup Build Configuration**
   Buat file `railway.toml` di dalam `ml-api/` folder:
   ```toml
   [build]
   builder = "NIXPACKS"
   buildCommand = "pip install -r requirements.txt"
   
   [deploy]
   startCommand = "gunicorn ml_server:app --bind 0.0.0.0:$PORT --workers 2"
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

6. **Auto Deploy from GitHub**
   - Push changes ke GitHub repository
   - Railway akan otomatis trigger deployment dari GitHub
   - Monitor deployment progress di Railway dashboard
   - Railway akan generate URL seperti: `https://ml-api-production-xxxx.up.railway.app`

#### Main API Server Deployment (Railway):

**Deploy from Same GitHub Repository**

1. **Create New Railway Service**
   - Di Railway dashboard, klik "New" untuk menambah service baru
   - Pilih "GitHub Repo" dan select repository yang sama
   - Buat service terpisah untuk main-api

2. **Configure Root Directory untuk Main API**
   - Di Railway dashboard service baru, masuk ke Settings
   - Set "Root Directory" ke `main-api/`
   - Railway akan detect Node.js project

3. **Setup Build Configuration**
   Buat file `railway.toml` di dalam `main-api/` folder:
   ```toml
   [build]
   builder = "NIXPACKS"
   buildCommand = "npm install"
   
   [deploy]
   startCommand = "npm start"
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

4. **Update package.json**
   Pastikan ada script start di `main-api/package.json`:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "engines": {
       "node": ">=14.0.0"
     }
   }
   ```

5. **Configure Environment Variables**
   Di Railway dashboard Variables tab untuk Main API service:
   ```env
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=moodflix-super-secret-key-2024
   ML_SERVER_URL=https://your-ml-api-service.up.railway.app
   ```

6. **Deploy Both Services**
   ```bash
   # Push ke GitHub repository
   git add .
   git commit -m "Add Railway configuration for both services"
   git push origin main
   
   # Railway akan auto-deploy kedua services dari repo yang sama
   ```

#### Deployment Workflow dari GitHub:

**Repository Structure:**
```
your-github-repo/
├── main-api/
│   ├── railway.toml
│   ├── package.json
│   ├── server.js
│   └── ...
├── ml-api/
│   ├── railway.toml
│   ├── requirements.txt
│   ├── ml_server.py
│   ├── model/
│   └── ...
└── README.md
```

**Step-by-Step Deployment:**

1. **Prepare Repository**
   ```bash
   # Ensure both railway.toml files are in correct directories
   git add main-api/railway.toml ml-api/railway.toml
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Deploy ML API Service (Deploy First)**
   - Railway Dashboard → New Project
   - Connect to GitHub → Select your repository
   - Configure:
     - Service Name: `moodflix-ml-api`
     - Root Directory: `ml-api/`
     - Environment Variables: FLASK_ENV, PORT, PYTHONPATH

3. **Deploy Main API Service (Deploy Second)**
   - Same Railway Project → Add Service
   - Connect to same GitHub repository
   - Configure:
     - Service Name: `moodflix-main-api`
     - Root Directory: `main-api/`
     - Environment Variables: NODE_ENV, PORT, JWT_SECRET, ML_SERVER_URL

4. **Connect Services**
   - Copy ML API service URL dari Railway dashboard
   - Update ML_SERVER_URL variable di Main API service
   - Railway akan auto-redeploy Main API dengan URL yang benar

5. **Verify Deployment**
   ```bash
   # Test ML API
   curl https://moodflix-ml-api-production-xxxx.up.railway.app/moods
   
   # Test Main API
   curl https://moodflix-main-api-production-xxxx.up.railway.app/moods
   
   # Test integration
   curl -X POST https://moodflix-main-api-production-xxxx.up.railway.app/recommend/advanced \
     -H "Content-Type: application/json" \
     -d '{"mood":"cheerful","top_k":5}'
   ```

#### Auto-Deployment dari GitHub:

**Railway akan otomatis deploy ulang ketika:**
- Ada push baru ke branch main/master
- Hanya folder yang berubah yang akan di-rebuild
- Monitoring real-time di Railway dashboard

**GitHub Integration Benefits:**
-  Otomatis sync dengan repository changes
-  Deploy history tracking dari commit
-  Easy rollback ke commit sebelumnya
-  Environment variables terpisah per service
-  Independent scaling untuk ML dan Main API

**Production URLs akan seperti:**
```
ML API: https://moodflix-ml-api-production-xxxx.up.railway.app
Main API: https://moodflix-main-api-production-xxxx.up.railway.app
```
## Pipeline FrontEnd
### Fitur Utama

- Pemilihan film berdasarkan mood pengguna.
- Desain antarmuka yang clean dan responsif.
- Penggunaan Webpack untuk pengelolaan aset dan build.
- Struktur proyek modular untuk kemudahan pengembangan.

### Teknologi yang Digunakan

- HTML5, CSS3, JavaScript (ES6)
- Webpack
- Node.js dan npm

### Struktur Direktori

```
moodflix/
├── dist/               # File hasil build
│   ├── index.html      # Halaman utama
│   └── images/         # Gambar-gambar yang digunakan
├── src/                # (Jika ada, berisi source code)
   ├── img/
   ├── pages/
   ├── routes/
   ├── services/
   ├── styles/
   └── index.html
├── package.json        # Informasi dan dependensi proyek
├── webpack.config.js   # Konfigurasi Webpack
└── .vscode/            # Pengaturan editor
```

### Cara Menjalankan Proyek

1. Clone repositori ini:
   ```bash
   git clone https://github.com/delliaptr/moodflix-api-capstone
   cd moodflix
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan Webpack:
   ```bash
   npm run build
   ```

4. Buka `dist/index.html` di browser untuk melihat hasilnya.

### Hosting 
Menggunakan Netlify