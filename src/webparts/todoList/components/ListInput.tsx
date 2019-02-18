import * as React from 'react';
import styles from './TodoList.module.scss'; 

export default class ListInput extends React.Component<any, any> {
    public render() {
        return(
        <div className={styles.inputContainer}>
            <input 
                value={this.props.value} 
                type="text" 
                onChange={this.props.onChangeValue} placeholder="Add Todo..."
            />
            <a href="#" onClick={() =>  this.props.onAddItem()}> Add Item </a>
        </div>
        );
    }
}