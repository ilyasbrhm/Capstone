const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Lokasi file untuk menyimpan pengguna
const USER_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Pastikan direktori data ada
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan file pengguna ada
if (!fs.existsSync(USER_FILE)) {
  fs.writeFileSync(USER_FILE, JSON.stringify([]), 'utf8');
}

// JWT Secret (sebaiknya disimpan di environment variable pada produksi)
const JWT_SECRET = 'moodflix-secret-key';

// Schema validasi untuk registrasi
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Schema validasi untuk login
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().required()
}).xor('username', 'email'); // Harus punya salah satu username atau email

// Fungsi untuk membaca semua pengguna dari file
const getUsers = () => {
  try {
    const data = fs.readFileSync(USER_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

// Fungsi untuk menyimpan pengguna ke file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving users file:', err);
    return false;
  }
};


// Handler untuk mendaftarkan pengguna baru
const register = async (request, h) => {
  try {
    // Validasi payload
    const { error, value } = registerSchema.validate(request.payload);
    if (error) {
      return h.response({ 
        error: 'Data registrasi tidak valid',
        details: error.details.map(d => d.message) 
      }).code(400);
    }
    
    const { username, email, password } = value;
    
    // Periksa apakah username atau email sudah digunakan
    const users = getUsers();
    if (users.some(user => user.username === username)) {
      return h.response({ 
        error: 'Username sudah digunakan' 
      }).code(409);
    }
    
    if (users.some(user => user.email === email)) {
      return h.response({ 
        error: 'Email sudah digunakan' 
      }).code(409);
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Buat pengguna baru
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Tambahkan ke daftar pengguna
    users.push(newUser);
    
    // Simpan kembali ke file
    if (!saveUsers(users)) {
      return h.response({ 
        error: 'Gagal menyimpan pengguna',
        details: 'Error menulis ke file pengguna' 
      }).code(500);
    }
    
    // Buat token JWT
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });
    
    // Hapus password dari respons
    const { password: _, ...userResponse } = newUser;
    
    return h.response({
      message: 'Registrasi berhasil',
      user: userResponse,
      token
    }).code(201);
  } catch (err) {
    console.error('Error registering user:', err);
    return h.response({ 
      error: 'Error registrasi pengguna',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk login pengguna
const login = async (request, h) => {
  try {
    // Validasi payload
    const { error, value } = loginSchema.validate(request.payload);
    if (error) {
      return h.response({ 
        error: 'Data login tidak valid',
        details: error.details.map(d => d.message) 
      }).code(400);
    }
    
    const { username, email, password } = value;
    
    // Cari pengguna berdasarkan username atau email
    const users = getUsers();
    const user = users.find(u => 
      (username && u.username === username) || 
      (email && u.email === email)
    );
    
    if (!user) {
      return h.response({ 
        error: 'Pengguna tidak ditemukan' 
      }).code(401);
    }
    
    // Verifikasi password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return h.response({ 
        error: 'Password salah' 
      }).code(401);
    }
    
    // Buat token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    // Hapus password dari respons
    const { password: _, ...userResponse } = user;
    
    return {
      message: 'Login berhasil',
      user: userResponse,
      token
    };
  } catch (err) {
    console.error('Error logging in:', err);
    return h.response({ 
      error: 'Error login',
      details: err.message 
    }).code(500);
  }
};

// Handler untuk mendapatkan data pengguna saat ini
const getCurrentUser = async (request, h) => {
  try {
    // Ambil user ID dari token yang telah diverifikasi
    const userId = request.auth.credentials.id;
    
    // Cari pengguna
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return h.response({ 
        error: 'Pengguna tidak ditemukan' 
      }).code(404);
    }
    
    // Hapus password dari respons
    const { password, ...userResponse } = user;
    
    return {
      message: 'Data pengguna ditemukan',
      user: userResponse
    };
  } catch (err) {
    console.error('Error getting current user:', err);
    return h.response({ 
      error: 'Error mendapatkan data pengguna',
      details: err.message 
    }).code(500);
  }
};

// Plugin untuk otentikasi JWT
const authPlugin = {
  name: 'auth',
  register: async (server) => {
    await server.register(require('hapi-auth-jwt2'));
    
    server.auth.strategy('jwt', 'jwt', {
      key: JWT_SECRET,
      validate: async (decoded, request, h) => {
        // Periksa apakah pengguna masih ada di database
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);
        
        if (!user) {
          return { isValid: false };
        }
        
        return { isValid: true, credentials: decoded };
      },
      verifyOptions: { algorithms: ['HS256'] }
    });
    
    // Default strategi otentikasi
    server.auth.default('jwt');
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  authPlugin,
  JWT_SECRET 
};