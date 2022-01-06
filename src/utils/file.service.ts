import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
    "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
    "region": process.env.AWS_REGION
});
@Injectable()
export class FileService {
    async upload(file: Express.Multer.File) {
        try {
            const mimeTypeFilter = ["image/jpeg", "image/png", "image/gif", "image/x-ms-bmp"];
            if (!mimeTypeFilter.includes(file.mimetype)) {
                throw new Error('not_image_file');
            } else {
                const fileData = await sharp(file.buffer)
                    .resize(1000, null, { withoutEnlargement: true })
                    .flatten({ background: '#ffffff' })
                    .jpeg({ quality: 100 })
                    .toBuffer();
                const uploadResult = await s3.upload({
                    Bucket: 'happypiggybank-attachments',
                    ACL: 'public-read',
                    Key: `${Date.now().toString()}-${uuidv4()}.jpg`,
                    Body: fileData
                }).promise();

                console.log('S3 File Upload Success: ', uploadResult.Location);
                return uploadResult.Location;
            }
        } catch (err) {
            console.log('S3 File Upload Error: ', err);
            return null;
        }
    }

    async delete(fileUri: string) {
        const fileKey = fileUri.split('/').slice(-1)[0];
        try {
            await s3.deleteObject({
                Bucket: 'happypiggybank-attachments',
                Key: fileKey
            }).promise();

            console.log('S3 File Delete Success: ', fileUri);
            return true;
        } catch (err) {
            console.log('S3 File Delete Error: ', err);
            return false;
        }
    }
 }
