import * as React from 'react';
import ListItem from './ListItem';
import { IListItem } from './IListItem';
import styles from './TodoList.module.scss'; 

class Header extends React.Component<any, any> {
    public render() {
        let deleteItem = this.props.onDeleteItem;
        let updateItem = this.props.onUpdateItem;
        let listItems =  this.props.items.map((item:IListItem, index:number): JSX.Element => {
            return(                            
                <ListItem delete={deleteItem} update={updateItem} completed={item.PercentComplete} item={item} key={index}/>
            );
        });

        return(                                                                                                                                            
            <div className={`${styles.listContainer}`}>           
                <ul>
                    {listItems}
                </ul>
            </div>
        );
    }
}

export default Header;
