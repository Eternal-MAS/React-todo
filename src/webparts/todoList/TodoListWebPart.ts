import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'TodoListWebPartStrings';
import TodoList from './components/App';
import { ITodoListProps } from './components/ITodoListProps';

export interface ITodoListWebPartProps {
  description: string;
}

export default class TodoListWebPart extends BaseClientSideWebPart<ITodoListWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ITodoListProps > = React.createElement(
      TodoList,
      {
        spHttpClient: this.context.spHttpClient,
        siteUrl:this.context.pageContext.web.absoluteUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
