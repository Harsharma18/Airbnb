const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const multer = require('multer');


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Create Cloudinary storage instance
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "Wandurlust",
      allowedFormats: ["png", "jpeg", "jpg"],
    },
});
const uploadLimit = multer({
    storage: storage,
    limits: { 
        fileSize: 1024 * 1024, // Default 1 MB file size limit
    },
    fileFilter: (file) => {
        let maxSize;

        // Set different file size limits based on file type
        if (file.mimetype === 'image/jpeg') {
            maxSize = 1024 * 1024; // 1 MB for JPEG
        } else if (file.mimetype === 'image/png') {
            maxSize = 500 * 1024; // 500 KB for PNG
        } else {
            // Reject file types other than JPEG and PNG
            throw new Error('Only JPEG and PNG files are allowed');
        }

        // Check if file size exceeds the specified limit
        if (file.size > maxSize) {
            throw new Error(`File size exceeds the limit for ${file.mimetype}`);
        }

        // Return true if the file is accepted, false otherwise
        return true;
    }
});


// Export Cloudinary and storage
module.exports = {
    cloudinary,
    storage,
};
