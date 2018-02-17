import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Modal from 'react-modal';
function convertTo24Hour(time) {
  var hours = parseInt(time.substr(0, 2));
  if(time.indexOf('am') != -1 && hours == 12) {
      time = time.replace('12', '0');
  }
  if(time.indexOf('pm')  != -1 && hours < 12) {
      time = time.replace(hours, (hours + 12));
  }
  return time.replace(/(am|pm)/, '');
}
class App extends Component {

  state = {
    accessToken: "",
    children: [],
    modalIn: false,
    modalOut: false,
    current_children: { name: {}, image: {} },
    hourSelected: 3,
    timeSelected: "pm",
    finalTimeSelected: "3:30pm"
  }

  constructor(props) {
    super(props);
    axios.post('https://tryfamly.co/api/daycare/tablet/login', {password: 'wq90au'})
    .then((response) => {
      if (response.status == 200) {
        this.setState({accessToken: response.data.accessToken});
        axios.get('https://tryfamly.co/api/daycare/tablet/group', {
          params: {
            accessToken: response.data.accessToken,
            groupId: '11fc220c-ebba-4e55-9346-cd1eed714620',
            institutionId: 'fb6c8114-387e-4051-8cf7-4e388a77b673'
          }
        }).then((response) => {
          this.setState({ children: response.data.children });
        });
      } else {
        console.log('login error: ', response.status, response.data);
      }
    });
  }

  componentWillMount() {
    Modal.setAppElement('body');
  }

  UpdateChildren(children) {
    console.log(children)
    this.setState({ current_children: children })
    if (children.checkedIn) {
      this.setState({ modalOut: true});
    } else {
      this.setState({ modalIn: true});
    }
  }

  renderChildrenMenu(children) {
    return (
      <figure>
      <img name={children.childId} key={children.childId} onClick={() => this.UpdateChildren(children)}
          src={children.image.small} className="small-children-iamge"
        />
      <figcaption>{children.name.fullName}</figcaption>
        
        
      </figure>
    );
  }
  changeHourTime(hour, time) {
    this.setState({hourSelected: hour, timeSelected: time});
  }
  finalTimeSelect(time){
    this.setState({finalTimeSelected: time});
  }
  callApiSign(childId){
    let finalTime = convertTo24Hour(this.state.finalTimeSelected);
    axios.post(`https://tryfamly.co/api/v2/children/${childId}/checkout`, { accessToken: this.state.accessToken, pickupTime: finalTime }).then(
      (response) => {
        console.log(response)
        if (response.status == 200) {
          this.setState({modalIn: false})
        }
      }
    )
  }
  callApiSignOut(childId){
    axios.post(`https://tryfamly.co/api/v2/children/${childId}/checkout`, { accessToken: this.state.accessToken }).then(
      (response) => {
        console.log(response)
        if (response.status == 200) {
          this.setState({modalOut: false})
        }
      }
    )
  }
  render() {
    return (
      <div className="App" id="App">
        <div className="children-menu">
          {this.state.children.map(children => this.renderChildrenMenu(children))}
        </div>
        <Modal isOpen={this.state.modalIn}
          contentLabel="ModalIn">
          <h1>{this.state.current_children.name.fullName}</h1>
          <div>
            <img src={this.state.current_children.image.small} className="small-children-iamge"/>
            Selected time: {this.state.finalTimeSelected}
            <div>
              <button className="timer" onClick={() => this.changeHourTime(8, "am")}>8am</button>
              <button className="timer" onClick={() => this.changeHourTime(9, "am")}>9am</button>
              <button className="timer" onClick={() => this.changeHourTime(10, "am")}>10am</button>
              <button className="timer" onClick={() => this.changeHourTime(11, "am")}>11am</button>
              <button className="timer" onClick={() => this.changeHourTime(12, "pm")}>12pm</button>
              <button className="timer" onClick={() => this.changeHourTime(1, "pm")}>1pm</button>
              <button className="timer" onClick={() => this.changeHourTime(2, "pm")}>2pm</button>
              <button className="timer" onClick={() => this.changeHourTime(3, "pm")}>3pm</button>
              <button className="timer" onClick={() => this.changeHourTime(4, "pm")}>4pm</button>
            </div>
            <div>
              <button className="timer" onClick={() => this.finalTimeSelect(`${this.state.hourSelected}:00${this.state.timeSelected}`)}>
                {this.state.hourSelected}:00{this.state.timeSelected}
              </button>

              <button className="timer" onClick={() => this.finalTimeSelect(`${this.state.hourSelected}:15${this.state.timeSelected}`)}>
                {this.state.hourSelected}:15{this.state.timeSelected}
              </button>

              <button className="timer" onClick={() => this.finalTimeSelect(`${this.state.hourSelected}:30${this.state.timeSelected}`)}>
                {this.state.hourSelected}:30{this.state.timeSelected}
              </button>

              <button className="timer" onClick={() => this.finalTimeSelect(`${this.state.hourSelected}:45${this.state.timeSelected}`)}>
                {this.state.hourSelected}:45{this.state.timeSelected}
              </button>
            </div>
          </div>
          <button onClick={() => this.setState({modalIn: false})}>
            CANCEL
          </button>
          <button onClick={() => this.callApiSign(this.state.current_children.childId)}>
            SIGN IN
          </button>
        </Modal>
        <Modal isOpen={this.state.modalOut}
          contentLabel="ModalOut">
          <h1>{this.state.current_children.name.fullName}</h1>
          <div>
            <img src={this.state.current_children.image.small} className="small-children-iamge"/>
          </div>
          <button onClick={() => this.setState({modalOut: false})}>
            CANCEL
          </button>
          <button onClick={() => this.setState({modalOut: false})}>
            SIGN OUT
          </button>
        </Modal>
      </div>
    );
  }
}

export default App;
