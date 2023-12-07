import { GithubWebSource } from './GithubWebSource';
import { ThunderstoreWebSource } from './ThunderstoreWebSource';

type WebSourceConstructor = new (url: string) => WebSource;

type WebSourceRegistration = {
  // store the type constructor
  constructor: WebSourceConstructor;
  // store an async url matcher function
  match: (url: string) => Promise<boolean>;
}

export abstract class WebSource {

  // array of implementations, populated by register()
  private static implementations: WebSourceRegistration[] = [];

  public static register(t: WebSourceConstructor) {
    console.log('registering ' + t.name);
    WebSource.implementations.push({ constructor: t, match: t.prototype.match });

  };

  public static async Select(url: string): Promise<WebSource> {
    for (const impl of WebSource.implementations) {
      if (await impl.match(url)) {
        return new impl.constructor(url);
      }
    }
    throw new Error('Unknown url ' + url);
  }

  public constructor(public readonly url: string) { }
  abstract load(): Promise<WebSource>;
  abstract getDownloadLink(): Promise<string>;
  abstract getName(): Promise<string>;
  abstract getDependencies(): Promise<string[]>;
  abstract getLatestVersion(): Promise<string>;
  abstract match(url: string): Promise<boolean>;
}