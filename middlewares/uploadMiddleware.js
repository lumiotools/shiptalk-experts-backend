import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `profile-picture-${Date.now()}.${file.mimetype.split('/')[1]}`),
});

const upload = multer({ storage });

export default upload;
