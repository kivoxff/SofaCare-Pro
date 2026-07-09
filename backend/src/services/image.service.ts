import ImageKit = require("@imagekit/nodejs")
import environment = require("../config/env")
import AppError = require("../utils/AppError");

class ImageService {
    async uploadImage(fileBuffer: Buffer, fileName: string, folderName: string): Promise<string> {

        const imageKitClient = new ImageKit.default({ // ImageKit.ImageKit can also be written
            privateKey: environment.imgKitPrivateKey
        })

        const uploadResponse = await imageKitClient.files.upload(
            {
                file: fileBuffer.toString("base64"),
                fileName: fileName + "-" + Date.now(),
                folder: folderName,
            }
        )

        if (!uploadResponse.url) {
            throw new Error("External Service: ImageKit upload succeeded, but no URL was returned."); // statusCode: 502
        }

        return uploadResponse.url;
    }
}

export = new ImageService();