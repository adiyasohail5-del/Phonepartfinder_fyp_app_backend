const { verifyToken } = require('./utils');
const multer = require('multer');
const path = require('path');

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }
    next();
  };
}

const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'parts';
    const isCommissionOrProof = file.fieldname === 'receipt' || 
                                file.fieldname === 'proof' || 
                                (req.originalUrl && (req.originalUrl.includes('commission') || req.originalUrl.includes('security-deposit')));
    if (isCommissionOrProof) {
      subfolder = 'commissions';
    }
    const dir = path.join(__dirname, 'uploads', subfolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || ext === '') {
      ext = '.jpg';
    }
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpe?g|png|webp|gif|bmp/i;
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ext || ext === '' || allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

function errorHandler(err, req, res, next) {
  console.error('Error caught by global handler:', err);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred'
  });
}

module.exports = {
  verifyToken: verifyTokenMiddleware,
  authorizeRoles,
  upload,
  errorHandler
};