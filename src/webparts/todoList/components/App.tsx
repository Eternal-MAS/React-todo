import * as React from 'react';
import styles from './TodoList.module.scss'; 
import List from './List';
import ListInput from './ListInput';
import { IListItem } from './IListItem';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export default class TodoList extends React.Component<any, any> {
  
  // Global 
  private listItemEntityTypeName: string = undefined;

  public constructor(props) {
    super(props); 

    this.state = {
      itemTitle: '',
      items:[]
    };
  }

  // ---------- Methods ------------ //
  public componentDidMount() {
    this.getToDosAsync().then((data) => {
      console.log("List Items:", data);
    });
  }

  private async getToDosAsync():Promise<any> {
      let items=[];
      await this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items`,
      SPHttpClient.configurations.v1).then(async(response)=>{
        if(response.ok)
        {
          await response.json().then((data)=>{
            items = data.value;
          });
        }
      });

      this.setState({items:items});
      return items;
  }

  private AddItem(): void {
    this.getListItemEntityTypeName()
      .then((listItemEntityTypeName: string): Promise<SPHttpClientResponse> => {
        const body: string = JSON.stringify({
          '__metadata': {
            'type': listItemEntityTypeName
          },
          'Title': this.state.itemTitle
        });
        return this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'Content-type': 'application/json;odata=verbose',
              'odata-version': ''
            },
            body: body
          });
      })
      .then((response: SPHttpClientResponse): Promise<IListItem> => {
        return response.json();
      })
      .then(async(item: IListItem) => {
        await this.getToDosAsync().then((itemsData)=>{          
          this.setState({
            items:itemsData
          });
          this.setState({itemTitle:''});
        });        
      }, (error: any) => {
        console.log('Error Creating Item: ', this.state.items);
        console.log(error);
        this.setState({
          items: []
        });
      });
  }

  private DeleteItem(id) { 
    let etag: string = undefined;  
    this.getItemIndex(id)  
      .then((itemId: number): Promise<SPHttpClientResponse> => {  
        if (itemId === -1) {  
          throw new Error('No items found in the list');  
        }  
    
        id = itemId;  
        return this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items(${id})`,  
          SPHttpClient.configurations.v1,  
          {  
            headers: {  
              'Accept': 'application/json;odata=nometadata',  
              'odata-version': ''  
            }  
          });  
      })  
      .then((response: SPHttpClientResponse): Promise<IListItem> => {  
        etag = response.headers.get('ETag');  
        return response.json();  
      })  
      .then(async(items: IListItem): Promise<SPHttpClientResponse> => {     
        return this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items(${id})`,  
          SPHttpClient.configurations.v1,  
          {  
            headers: {  
              'Accept': 'application/json;odata=nometadata',  
              'Content-type': 'application/json;odata=verbose',  
              'odata-version': '',  
              'IF-MATCH': etag,  
              'X-HTTP-Method': 'DELETE'  
            }  
          });  
      })  
      .then(async(response: SPHttpClientResponse) => {  
        this.getToDosAsync().then((itemsData) => {
          this.setState({   
            items: itemsData  
          }); 
        }); 
      }, (error: any): void => {  
        console.log('Error: ' ,error);
        this.setState({   
          items: []  
        });  
      });  
  }  

  private UpdateItem(id): void {

    let etag: string = undefined;
    let listItemEntityTypeName: string = undefined;
    this.getListItemEntityTypeName()
      .then((listItemType: string): Promise<number> => {
        listItemEntityTypeName = listItemType;
        return this.getItemIndex(id);
      })
      .then((itemId: number): Promise<SPHttpClientResponse> => {
        if (itemId === -1) {
          throw new Error('No items found in the list');
        }

        id = itemId;
        return this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items(${id})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'odata-version': ''
            }
          });
      })
      .then((response: SPHttpClientResponse): Promise<IListItem> => {
        etag = response.headers.get('ETag');
        return response.json();
      })
      .then(async(item: IListItem): Promise<SPHttpClientResponse> => {
        const body: string = JSON.stringify({
          '__metadata': {
            'type': listItemEntityTypeName
          },
          'PercentComplete': item.PercentComplete == 0 ? 1 : 0
        });
        return this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items(${id})`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata',
              'Content-type': 'application/json;odata=verbose',
              'odata-version': '',
              'IF-MATCH': etag,
              'X-HTTP-Method': 'MERGE'
            },
            body: body
          });
      })
      .then(async(response: SPHttpClientResponse)=> {
        await this.getToDosAsync().then((itemData) => {
          const index = this.itemIndex(id);
          this.setState({
            status: `Item '${itemData[index].Title}' successfuly updated.`,
            items: itemData
          });
        });        
      }, (error: any): void => {
        this.setState({
          status: `Error updating item: ${error}`,
          items: []
        });
      });
  }

  // ---------- Helper Methods ------------ //
  private handleChangeValue = e => {
    this.setState({itemTitle: e.target.value});
  }

  private itemIndex(id): number {
    return this.state.items.map(item => item.Id).indexOf(id);
  }  

  private getItemIndex(id): Promise<number> {  
  
    return new Promise<number>((resolve: (itemId: number) => void, reject: (error: any) => void): void => {  
      this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')/items?(${id})$select=Id`,  
        SPHttpClient.configurations.v1,  
        {  
          headers: {  
            'Accept': 'application/json;odata=nometadata',  
            'odata-version': ''  
          }  
        })  
        .then((response: SPHttpClientResponse): Promise<{ value: { Id: number }[] }> => {  
          return response.json();  
        }, (error: any): void => {  
          reject(error);  
        })  
        .then((response: { value: { Id: number }[] }): void => {  
          if (response.value.length === 0) {  
            resolve(-1);  
          }  
          else {  
            let index = response.value.map((item) => item.Id).indexOf(id);
            resolve(response.value[index].Id);  
          }  
        });  
    });  
  }
  
  private getListItemEntityTypeName(): Promise<string> {
    return new Promise<string>((resolve: (listItemEntityTypeName: string) => void, reject: (error: any) => void): void => {
      if (this.listItemEntityTypeName) {
        resolve(this.listItemEntityTypeName);
        return;
      }

      this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('ToDo')?$select=ListItemEntityTypeFullName`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        })
        .then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
          return response.json();
        }, (error: any): void => {
          reject(error);
        })
        .then((response: { ListItemEntityTypeFullName: string }): void => {
          this.listItemEntityTypeName = response.ListItemEntityTypeFullName;
          resolve(this.listItemEntityTypeName);
        });
    });
    
  }

  // ---------- Render Method ------------ //
  public render(): React.ReactElement<any> {
    return (
      <div className={ styles.todoList }>
        <div className={ styles.container }>
          <ListInput onAddItem={this.AddItem.bind(this)} 
                     onChangeValue={this.handleChangeValue.bind(this)} 
                     value={this.state.itemTitle}
          />
          <List onDeleteItem={this.DeleteItem.bind(this)}
                onUpdateItem={this.UpdateItem.bind(this)}  
                items={this.state.items}
          />
        </div>
      </div>
    );
  }
}
