import { Controller, Post, Get, UseGuards, Request, Body, Param, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body() body: { recipientEmail: string; expirationDate: string; password: string },
    @Request() req: any
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!body.password) throw new BadRequestException('Password is required');
    return this.fileService.uploadFile({
      fileName: file.originalname,
      owner: req.user._id,
      recipientEmail: body.recipientEmail,
      buffer: file.buffer,
      expirationDate: new Date(body.expirationDate),
      password: body.password,
    });
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('list/send')
  async listSend(@Request() req: any) {
    // List all files sent by the current user
    return await this.fileService.listSend(req.user._id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('list/receive')
  async listReceive(@Request() req: any) {
    // List files received by the current user (by email)
    return await this.fileService.listReceive(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('retrieve/:id')
  async retrieveFile(@Param('id') id: string, @Body() body: { password: string }) {
    if (!body.password) throw new BadRequestException('Password is required');
    const result = await this.fileService.retrieveFile(id, body.password);
    if (!result) throw new BadRequestException('File not found');
    // For demo, just return file metadata and indicate success
    return { file: result.file, message: 'Password matched. File decrypted.' };
    // To return the file buffer, you could stream or send as base64, etc.
  }
}
