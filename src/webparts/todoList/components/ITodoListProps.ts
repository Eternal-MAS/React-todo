import { SPHttpClient } from '@microsoft/sp-http';

export interface ITodoListProps {
  spHttpClient: SPHttpClient;
  siteUrl:string;
}