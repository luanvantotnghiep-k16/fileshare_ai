import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument } from './schemas/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { FileRepository } from './repository/file.repository';

@Injectable()
export class FileService {


  constructor(
    private readonly fileRepository: FileRepository,

  ) {}


  async uploadFile(data: {
    fileName: string;
    owner: string;
    recipientEmail: string;
    buffer: Buffer;
    expirationDate: Date;
    password: string;
  }): Promise<FileDocument> {
    // Encrypt file using password
    const key = crypto.createHash('sha256').update(data.password).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(data.buffer), cipher.final()]);
    const encryptedData = Buffer.concat([iv, encrypted]); // prepend IV
    const encryptedPath = path.join('uploads', `${Date.now()}_${data.fileName}`);
    fs.writeFileSync(encryptedPath, encryptedData);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const file =  {
      fileName: data.fileName,
      owner: data.owner,
      recipientEmail: data.recipientEmail,
      encryptedPath,
      expirationDate: data.expirationDate,
      passwordHash,
      createdAt: new Date(),
    } as unknown as FileDocument;
    return this.fileRepository.create(file);
  }

  async retrieveFile(id: string, password: string): Promise<{ file: FileDocument, decryptedBuffer: Buffer } | null> {
    const file = await this.fileRepository.findOne({ _id: id });
    if (!file) return null;
    const match = await bcrypt.compare(password, file.passwordHash);
    if (!match) throw new UnauthorizedException('Incorrect password');
    // Decrypt file
    const encryptedData = fs.readFileSync(file.encryptedPath);
    const iv = encryptedData.slice(0, 16);
    const encrypted = encryptedData.slice(16);
    const key = crypto.createHash('sha256').update(password).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return { file, decryptedBuffer: decrypted };
  }
  
  async listSend(ownerId: string): Promise<FileDocument[]> {
    // List all files sent by owner
    return await this.fileRepository.find({ owner: ownerId });
  }
  
  async listReceive(email: string): Promise<FileDocument[]> {
    // List files received by user (by email)
    return await this.fileRepository.find({ recipientEmail: email });
  }
}
