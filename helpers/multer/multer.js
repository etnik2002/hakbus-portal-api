const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});


const cloudinaryProductStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: 'products',
      format: async (req, file) => 'png',
      public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const cloudinaryCategoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: 'categories',
      format: async (req, file) => 'png',
      public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const productUpload = multer({ storage: cloudinaryProductStorage });
const categoryUpload = multer({ storage: cloudinaryCategoryStorage });

module.exports = { productUpload,categoryUpload };
