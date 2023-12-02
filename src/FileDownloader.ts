import axios from 'axios';
import fs from 'fs';
import { finished } from 'stream/promises';

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
}