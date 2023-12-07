import * as fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import decompress from 'decompress';
import * as path from 'path';
import { promises as pfs } from 'fs';

export class FileOperations {

  async exists(path: string): Promise<'dir' | 'file' | null> {
    try {
      const stat = await fs.promises.stat(path);
      return stat.isDirectory() ? 'dir' : 'file';
    } catch {
      return null;
    }
  }

  async listFiles(directoryPath: string): Promise<string[]> {
    return await pfs.readdir(directoryPath);
  }

  async findModFolders(dir: string): Promise<string[]> {
    const files = await pfs.readdir(dir);
    const folders = [];
    for (const file of files) {
      const filePath = path.join(dir, file);
      if ((await pfs.lstat(filePath)).isFile() && file.endsWith('.dll')) {
        folders.push(dir);
        return folders;
      }
    }

    for (const file of files) {
      const filePath = path.join(dir, file);
      if ((await pfs.lstat(filePath)).isDirectory()) {
        const dll = await this.findModFolders(filePath);
        if (dll) {
          folders.push(...dll);
        }
      }
    }

    return folders;
  }

  async deleteAny(path: string): Promise<boolean> {
    const exists = await this.exists(path);
    if (exists == 'dir') {
      await pfs.rm(path, { recursive: true });
    } else if (exists == 'file') {
      await pfs.unlink(path);
    }
    return !!exists;
  }

  async makeEmptyDir(dir: string): Promise<void> {
    await this.deleteAny(dir);
    await pfs.mkdir(dir);
  }

  async makeSureDirExists(dir: string): Promise<void> {
    const exists = await this.exists(dir);
    if (exists === 'file') {
      await pfs.unlink(dir);
      await pfs.mkdir(dir, { recursive: true });
    }
    else if (!exists) {
      await pfs.mkdir(dir, { recursive: true });
    }
  }

  extractZip(filePath: string, targetPath: string): Promise<any> {
    return decompress(filePath, targetPath);
  };
}