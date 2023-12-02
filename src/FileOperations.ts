import * as fs from 'fs';
import { promisify } from 'util';
import stream from 'stream';
import unzipper from 'unzipper';
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
    const dlls = [];
    for (const file of files) {
        const filePath = path.join(dir, file);
        if ((await pfs.lstat(filePath)).isFile() && file.endsWith('.dll')) {
            dlls.push(dir);
            return dlls;
        }
    }
  
    for (const file of files) {
        const filePath = path.join(dir, file);
        if ((await pfs.lstat(filePath)).isDirectory()) {
            const dll = await this.findModFolders(filePath);
            if (dll) {
                dlls.push(...dll);
            }
        }
    }
  
    return dlls;
  }

  async deleteAny(path: string): Promise<boolean> {
    const exists = await this.exists(path);
    if(exists == 'dir') {
      console.log('deleting dir ' + path);
      pfs.rm(path, { recursive: true });
    } else if(exists == 'file') {
      console.log('deleting file ' + path);
      pfs.unlink(path);
    }
    return !!exists;
  }

  async makeEmptyDir(dir: string): Promise<void> {
    this.deleteAny(dir);
    console.log('creating dir ' + dir);
    pfs.mkdir(dir);
  }

  extractZip(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(unzipper.Extract({ path: './zip' }))
        .on('close', resolve)
        .on('error', reject);
    });
  };
}