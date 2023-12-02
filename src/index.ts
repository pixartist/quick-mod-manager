import fs from 'fs';
import * as path from 'path';
import { WebSource } from './Sources/WebSource';
import { FileDownloader } from './FileDownloader';
import { FileOperations } from './FileOperations';

async function getMod(url: string, outPath: string, forceDl: boolean = false) {
    const scraper = await WebSource.Select(url);
    const downloader = new FileDownloader();
    const fileOps = new FileOperations();
    await scraper.load();
    const fileUrl = await scraper.getDownloadLink();
    console.log('file url ' + fileUrl);
    const modName = await scraper.getName();
    console.log('mod name ' + modName);
    // exclude mods that contain the word "BepInEx"
    if(modName.includes('BepInEx')) {
        console.log('skipping ' + modName);
        return;
    }
    const dependencies = await scraper.getDependencies();	

    // get all dependencies
    for(const dep of dependencies) {
        await getMod(dep, outPath, forceDl);
    }
    console.log('dependencies ' + dependencies);
    const filePath = path.join('./cache/', modName + '.zip');

    // make sure cache dir exists
    if(!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath);
    }

    // check if mod is already installed
    if(!fs.existsSync(filePath) || forceDl) {
      await downloader.download(fileUrl, filePath);
    }

    // extract mod
    fileOps.makeEmptyDir('./zip');
    console.log('extracting mod ' + filePath + ' to ./zip');
    await fileOps.extractZip(filePath);
    console.log('extracted mod ' + modName + ' to ./zip');
    // go through extracted files recursively and find the topmost folder with a dll
    const modFolders = await fileOps.findModFolders('./zip');
    if(modFolders.length <= 0) {
        throw new Error('Could not find any mods');
    }
    
    for(const modFolder of modFolders) {
      const targetPath = path.join(outPath, modFolder == './zip' ? modName : path.basename(modFolder));
      // delete existing mod folder
      if(fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true });
      }
      // copy mod folder to target
      fs.renameSync(modFolder, targetPath);
    }
    fs.rmSync('./zip', { recursive: true });
}

// Usage example
async function main() {
  WebSource.register(require('./Sources/GithubWebSource').GithubWebSource);
  WebSource.register(require('./Sources/ThunderstoreWebSource').ThunderstoreWebSource);
  // load a config json that contains the target directory and a list of mod urls
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  for(const modUrl of config.mods) {
    await getMod(modUrl, config.targetDir);
  }
}
console.log('start');
main();