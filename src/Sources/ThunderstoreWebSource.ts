import axios from "axios";
import { WebSource } from "./WebSource";
import cheerio from 'cheerio';

export class ThunderstoreWebSource extends WebSource {
  match(url: string): Promise<boolean> {
    return Promise.resolve(url.includes('thunderstore.io'));
  }
  protected root?: cheerio.Root;
  async load(): Promise<WebSource> {
    const response = await axios.get(this.url);
    this.root = cheerio.load(response.data);
    return this;
  }
  async getDownloadLink(): Promise<string> {
    return this.wrapped(() => this.root!('a:contains("Manual Download")').attr('href'));
  }
  async getName(): Promise<string> {
    return this.wrapped(() => this.root!('h1.mt-0').text());
  }
  async getDependencies(): Promise<string[]> {
    return this.wrapped(() => this.root!('div.list-group-item > div:nth-child(1) > div:nth-child(2) > h5:nth-child(1) > a:nth-child(1)')
      .map((i, el) => 'https://thunderstore.io' + cheerio(el).attr('href')).get());
  }
  async getLatestVersion(): Promise<string> {
    return this.wrapped(() => this.root!('table.table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)').text());
  }
  protected wrapped<T>(f: () => T | undefined): NonNullable<T> {
    if (!this.root) {
      throw new Error('WebScraper not loaded');
    }
    const v = f();
    if (!v) {
      throw new Error('Could not find element(s)');
    }
    return v;
  }
}