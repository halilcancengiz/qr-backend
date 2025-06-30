import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import responseHelper from "../helpers/responseHelper.js";

// Depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${ext}`);
  },
});

// Dosya tipi kontrolü
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Sadece görsel dosyaları kabul edilir."), false);
  }
};

// Multer instance
const rawUpload = multer({ storage, fileFilter });

// Custom wrapper: Hataları responseHelper ile döner
function single(fieldName) {
  const middleware = rawUpload.single(fieldName);

  return function (req, res, next) {
    middleware(req, res, (err) => {
      if (err) {
        const message = err.message || "Dosya yükleme sırasında bir hata oluştu.";
        return responseHelper(res, 400, message);
      }
      next();
    });
  };
}

// Genişletilebilir yapıya uygun export
export default { single };
