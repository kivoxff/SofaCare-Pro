import multer = require("multer");
import { type Multer } from "multer"

const multerUpload: Multer = multer({ storage: multer.memoryStorage() });

export = multerUpload;