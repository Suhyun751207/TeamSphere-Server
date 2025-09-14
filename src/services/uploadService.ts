// src/services/uploadService.ts
import bucket from "@utils/firebase";

export class UploadService {
  static async uploadFile(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const blob = bucket.file(fileName);

        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (err) => {
          reject(err);
        });

        blobStream.on("finish", async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      } catch (error) {
        reject(error);
      }
    });
  }
}
