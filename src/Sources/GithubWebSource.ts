import { Api } from "../Api";
import { Config } from "../Config";
import { WebSource } from "./WebSource";

export class GithubWebSource extends WebSource {
  match(url: string): Promise<boolean> {
    return Promise.resolve(url.includes('github.com'));
  }

  private fileRegex = new RegExp('BepInEx' + Config.bepInEx, 'i');
  private latest: any;
  private main: any;

  async load(): Promise<WebSource> {
    this.latest = await this.getApi('/releases/latest');
    this.main = await this.getApi('');
    return this;
  }
  async getDownloadLink(): Promise<string> {
    const assets = this.latest.assets as [];
    const urls = assets.map((asset: any) => asset.browser_download_url)
    const link = this.findCorrectDownloadLink(urls);
    if (!link) {
      throw new Error('Could not find download link');
    }
    return link;
  }
  async getName(): Promise<string> {
    return this.main.name;
  }
  async getDependencies(): Promise<string[]> {
    return [];
  }
  private findCorrectDownloadLink(links: string[]): string | null {
    const validLinks = links.filter(link => link.includes('/releases/download/'));
    for (const link of validLinks) {
      console.log('checking link ' + link);
      if (this.fileRegex.test(link)) {
        return link;
      }
    }
    return validLinks.length > 0 ? validLinks[0] : null;
  }
  private async getApi(path: string) {
    return await Api.get(this.url.replace('https://github.com/', 'https://api.github.com/repos/') + path);
  }
}