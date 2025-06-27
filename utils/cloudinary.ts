import { v2 as cloudinary } from "cloudinary"; 
import multer from "multer"; 
import { CloudinaryStorage } from "multer-storage-cloudinary"; 
 
// Configure Cloudinary 
cloudinary.config({ 
  cloud_name: "dkltqpci0", 
  api_key: "754726425731953", 
  api_secret: "eVd0Hk7xHifbP2p-8suLfqW42Y0", 
}); 
 
// Multer Storage Configuration 
const storage = new CloudinaryStorage({ 
  cloudinary: cloudinary, 
  params: { 
    folder: "Univers", 
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "avi", "mov"], 
    public_id: (req: Express.Request, file: Express.Multer.File) => `${Date.now()}_${file.originalname}`, 
    format: 'jpg',
    quality: 'auto:good'  
  } as any,  
}); 
 
// Multer Upload Middleware 
const upload = multer({ storage }); 
 
export { cloudinary, upload };
