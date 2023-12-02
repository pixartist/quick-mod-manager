import axios from 'axios';
import fs from 'fs';
import { finished } from 'stream/promises';
import path from 'path';
export class FileDownloader {
  async download(url: string, outputPath: string): Promise<void> {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    response.data.pipe(writer);
    await finished(writer);
  }
  async getActualFileName(url: string): Promise<string> {
    let fileName = path.basename(url);
    if (!fileName.endsWith('.zip')) {
      const response = await axios({
        method: 'head',
        url: url,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (response.headers.location && response.headers.location.endsWith('.zip')) {
        fileName = path.basename(response.headers.location);
      }
    }
    return fileName;
  }
}