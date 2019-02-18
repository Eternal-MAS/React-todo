import * as React from 'react';
import styles from './TodoList.module.scss'; 

class ListItem extends React.Component<any,any> {
    public render() {
        return(
            <span className={styles.listItemContainer}>
                <label className={styles.checkboxContainer} aria-label="Item Status">
                    <input 
                        onChange={(e) => this.props.update(this.props.item.Id)} 
                        type="checkbox" checked={this.props.completed != 0 ? true : false}
                    /> 
                    <span className={styles.checkmark}></span>
                </label>

                <li className={this.props.item.PercentComplete ? `${styles.completed}` : `${styles.notCompleted}`} >
                    {this.props.item.Title}
                </li>

                <span aria-label="Remove Item" className={styles.remove} onClick={() => this.props.delete(this.props.item.Id)}>&#10005;</span>

            </span>
        );
    }
}

export default ListItem;
