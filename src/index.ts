import * as path from 'path';
import { WebSource } from './Sources/WebSource';
import { FileDownloader } from './FileDownloader';
import { FileOperations } from './FileOperations';
import { promises as pfs } from 'fs';

async function getMod(url: string, outPath: string, forceDl: boolean = false) {
  const scraper = await WebSource.Select(url);
  const downloader = new FileDownloader();
  const fileOps = new FileOperations();
  const cacheDir = path.resolve('./cache');
  const zipDir = path.resolve('./zip');
  await scraper.load();

  const fileUrl = await scraper.getDownloadLink();
  console.log('file url: ' + fileUrl);

  const modName = await scraper.getName();
  console.log('mod name: ' + modName);

  // exclude mods that contain the word "BepInEx"
  if (modName.includes('BepInEx')) {
    console.log('skipping ' + modName);
    return;
  }
  const dependencies = await scraper.getDependencies();

  // get all dependencies
  for (const dep of dependencies) {
    await getMod(dep, outPath, forceDl);
  }
  console.log('dependencies: ' + dependencies);
  const filePath = path.join(cacheDir, modName + '.zip');

  // make sure cache dir exists
  await fileOps.makeSureDirExists(cacheDir);

  // check if mod is already installed
  if (!await fileOps.exists(filePath) || forceDl) {
    await downloader.download(fileUrl, filePath);
  }

  // extract mod
  await fileOps.makeEmptyDir(zipDir);
  console.log('extracting mod ' + filePath + ' to ' + zipDir);
  await fileOps.extractZip(filePath);
  console.log('extracted mod ' + modName + ' to ' + zipDir);
  // go through extracted files recursively and find the topmost folder with a dll
  const modFolders = await fileOps.findModFolders(zipDir);
  if (modFolders.length <= 0) {
    throw new Error('Could not find any mods');
  }
  console.log('found mod folders ' + modFolders);
  for (const modFolder of modFolders) {
    const targetfolderName = modFolder == zipDir ? modName : path.basename(modFolder);
    const targetPath = path.join(outPath, targetfolderName);
    // delete existing mod folder
    console.log('deleting existing mod folder ' + targetPath);
    await fileOps.deleteAny(targetPath);
    // copy mod folder to target
    console.log('copying mod folder ' + modFolder + ' to ' + targetPath);
    await pfs.rename(modFolder, targetPath);
  }
}

// Usage example
async function main() {
  WebSource.register(require('./Sources/GithubWebSource').GithubWebSource);
  WebSource.register(require('./Sources/ThunderstoreWebSource').ThunderstoreWebSource);
  // load a config json that contains the target directory and a list of mod urls
  const config = JSON.parse(await pfs.readFile('./config.json', 'utf8'));
  for (const modUrl of config.mods) {
    await getMod(modUrl, config.targetDir);
  }
}
console.log('start');
main();