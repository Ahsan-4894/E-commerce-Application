import multer from "multer";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const uploadSingleAvatar = upload.single("avatar");
const attachmentsMulter = upload.array("files", 5);

export { uploadSingleAvatar, attachmentsMulter };
