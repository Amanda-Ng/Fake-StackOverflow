import React from 'react';
import '../stylesheets/App.css';

export default class ListButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentListCount: 1
    };
    this.itemsPerList = 5;
    this.partitioning = this.partitioning.bind(this);
  }
  
  partitioning = (num) => {
    this.setState({currentListCount: num}, () => {
      const { list, setList } = this.props;
      const { currentListCount } = this.state;
      const itemsPerList = this.itemsPerList;

      const indexOfLastItem = currentListCount * itemsPerList;
      const indexOfFirstItem = indexOfLastItem - itemsPerList;
      const currentList = list.slice(indexOfFirstItem, indexOfLastItem);
      setList(currentList);
      console.log(currentList);
    });
  };
  // componentDidMount() {
    
  // }

  render() {
    const { list } = this.props;
    const { currentListCount } = this.state;
    const itemsPerList = this.itemsPerList;
    
    return (
      <div className="partitions">
        <button
          onClick={() => this.partitioning(currentListCount > 1 ? currentListCount - 1 : 1)}
          disabled={currentListCount === 1}
        >
          Prev
        </button>
        <button
            onClick={() => this.partitioning(
              currentListCount === Math.ceil(list.length / itemsPerList) ? 1 : currentListCount + 1)}
        >
          Next
        </button>
      </div> 
    );
  }
}