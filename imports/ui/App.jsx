import React, {Component, PropTypes} from 'react';
import ReactDOM                      from 'react-dom';
import { Meteor }                    from 'meteor/meteor';
import { createContainer }           from 'meteor/react-meteor-data';

import { Tasks }                     from '../api/tasks.js';

import Task                          from './Task.jsx';
import AccountsUIWrapper             from './AccountsUIWrapper.jsx'

// App component - represents the whole App
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      inputClass: "input input--hoshi",
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call('tasks.insert', text);

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';

    // Reset input state
    this.setState({inputClass: "input input--hoshi"});

  }

  handleInput(event) {
    // Saving value into the state
    if (event.target.value !== '') {
      this.setState({inputClass: "input input--hoshi input--filled"});
    } else {
      this.setState({inputClass: "input input--hoshi"});
    }
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    })
  }

  _getTodoTitle(todoCount) {
    if (todoCount === 0) {
      return "Tasks completed!";
    } else if (todoCount === 1) {
      return "1 Task Left";
    } else {
      return `${todoCount} Tasks Left`;
    }
  }

  _getInputClass() {

    if (value === '') {
      return "input input--hoshi";
    } else {
      return "input input--hoshi input--filled";
    }
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}/>
      )
    });
  }

  // <label className="hide-completed">
  //   <input
  //     type="checkbox"
  //     readOnly
  //     checked={this.state.hideCompleted}
  //     onClick={this.toggleHideCompleted.bind(this)} />
  //   Hide Completed Tasks
  // </label>

  render() {
    return (
      <div className='container'>
        <header>
          <h1>Todo List</h1>

          <label className="task-count">{this._getTodoTitle(this.props.incompleteCount)}</label>
          <AccountsUIWrapper />
        </header>

        <div className='form-layout'>
          {this.props.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
              <span className={this.state.inputClass}>
                <input
                  className="input__field input__field--hoshi"
                  type="text"
                  ref="textInput"
                  onChange={this.handleInput.bind(this)}
                />
      					<label className="input__label input__label--hoshi input__label--hoshi-color-1">
                  <span className="input__label-content input__label-content--hoshi">Add a task...</span>
      					</label>
      				</span>
            </form> : ''
          }
        </div>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
