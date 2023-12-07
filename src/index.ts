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
  const modFileName = await downloader.getActualFileName(fileUrl);
  console.log('[' + modName + '] file name: ' + modFileName);
  const modVersion = await scraper.getLatestVersion();
  console.log('[' + modName + '] mod version: ' + modVersion);

  // exclude mods that contain the word "BepInEx"
  if (modName.includes('BepInEx')) {
    console.log('[' + modName + '] skipping ' + modName);
    return;
  }
  const dependencies = await scraper.getDependencies();

  // get all dependencies
  for (const dep of dependencies) {
    await getMod(dep, outPath, forceDl);
  }
  console.log('[' + modName + '] dependencies: ' + dependencies);

  // make sure cache dir exists
  const modCacheDir = path.join(cacheDir, modName, modVersion);
  await fileOps.makeSureDirExists(modCacheDir);
  const modCacheFile = path.join(modCacheDir, modFileName);


  // check if mod is already installed
  if (!await fileOps.exists(modCacheFile) || forceDl) {
    await downloader.download(fileUrl, modCacheFile);
  }

  // extract mod
  await fileOps.makeEmptyDir(zipDir);
  console.log('[' + modName + '] extracting mod ' + modCacheFile + ' to ' + zipDir);
  await fileOps.extractZip(modCacheFile, zipDir);
  console.log('[' + modName + '] extracted mod ' + modName + ' to ' + zipDir);
  // go through extracted files recursively and find the topmost folder with a dll
  const modFolders = await fileOps.findModFolders(zipDir);
  if (modFolders.length <= 0) {
    throw new Error('[' + modName + '] could not find any mods');
  }

  // make sure target dir exists
  await fileOps.makeSureDirExists(outPath);

  console.log('[' + modName + '] found mod folders ' + modFolders);
  for (const modFolder of modFolders) {
    const targetfolderName = modFolder == zipDir ? modFileName.substring(0, modFileName.length - 4) : path.basename(modFolder);
    const targetPath = path.join(outPath, targetfolderName);
    // delete existing mod folder
    console.log('[' + modName + '] deleting existing mod folder ' + targetPath);
    await fileOps.deleteAny(targetPath);
    // copy mod folder to target
    console.log('[' + modName + '] copying mod folder ' + modFolder + ' to ' + targetPath);
    await pfs.rename(modFolder, targetPath);
  }
}

// Usage example
async function main() {
  WebSource.register(require('./Sources/GithubWebSource').GithubWebSource);
  WebSource.register(require('./Sources/ThunderstoreWebSource').ThunderstoreWebSource);
  // load a config json that contains the target directory and a list of mod urls
  const config = JSON.parse(await pfs.readFile('./config.json', 'utf8'));

  // rename outdir (and delete previous backup)
  const outDir = path.resolve(config.targetDir);
  const backupDir = path.resolve(config.targetDir + '_backup');
  if (await (new FileOperations()).exists(outDir)) {
    await pfs.rm(backupDir, { recursive: true, force: true });
    await pfs.rename(outDir, backupDir);
  }

  for (const modUrl of config.mods) {
    await getMod(modUrl, config.targetDir);
  }
}
console.log('start');
main().then(() => console.log('done')).catch(console.error);