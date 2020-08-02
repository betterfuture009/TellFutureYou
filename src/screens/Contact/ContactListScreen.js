import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {connect} from 'react-redux';
import Toast from 'react-native-easy-toast'
import Contacts from 'react-native-contacts';
import HeaderInfoBar from '../../components/HeaderInfoBar'
import SearchBox from '../../components/SearchBox'
import LoadingOverlay from '../../components/LoadingOverlay'
import AddContactDialog from '../../components/AddContactDialog'
import ContactCell from '../../components/Cells/ContactCell'
import actionTypes from '../../actions/actionTypes';
import EmptyView from '../../components/EmptyView'
import { TOAST_SHOW_TIME, Status } from '../../constants.js'
import Colors from '../../theme/Colors'
import Messages from '../../theme/Messages'
import { filterName } from '../../functions';


class ContactListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      contacts: [],
      originalContacts: [],
      isShowAddContactDialog: false,
    }    
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser && currentUser.contacts && currentUser.contacts.length > 0) {
      this.sortContacts(currentUser.contacts);
      this.setState({
        contacts: currentUser.contacts, 
        originalContacts: currentUser.contacts
      });
    }

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.props.dispatch({
        type: actionTypes.GET_CONTACT_STATUS,
        userId: currentUser._id,
      });
    });
  }

  componentWillUnmount() {
    this.focusListener();
  }

  sortContacts(contacts) {
    contacts.sort((a, b) => {
      const nameA = filterName(a.firstName.trim(), a.lastName.trim());
      const nameB = filterName(b.firstName.trim(), b.lastName.trim());
      return nameA > nameB ? 1 : -1;
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currentUser != this.props.currentUser) {
      if (this.props.currentUser.contacts && this.props.currentUser.contacts.length > 0) {
        this.sortContacts(this.props.currentUser.contacts);
        this.setState({
          contacts: this.props.currentUser.contacts,
          originalContacts: this.props.currentUser.contacts,
        });
      }  
    }

    if (prevProps.sendInviteStatus != this.props.sendInviteStatus) {
      if (this.props.sendInviteStatus == Status.SUCCESS) {
        this.setState({isLoading: false});
        this.showResultMessage(Messages.SuccessInvite, false);
      } 
      else if (this.props.sendInviteStatus == Status.FAILURE) {
        this.onFailure();
      }      
    }
  }

  onFailure() {
    this.setState({isLoading: false});
    this.refs.toast.show(this.props.errorMessage, TOAST_SHOW_TIME);
  }

  onBack() {
    this.props.navigation.goBack();
  }

  searchContacts(keyword) {
    var text = keyword.toLowerCase().trim();
    const { originalContacts } = this.state;
    console.log("originalContacts: ", originalContacts);
    if (text && text.length > 0) {
        var list = [];
        if (originalContacts && originalContacts.length > 0) {
          originalContacts.forEach(item => {
            const name = item.firstName + " " + item.lastName;
            if (name.toLowerCase().indexOf(text) >= 0) {
                list.push(item);
            }
          });
          this.setState({contacts: list});
        }
    } 
    else {
        this.setState({contacts: originalContacts});
    }
  }

  onSelectContact=(c)=> {
    c.selected = !c.selected;
    const { contacts } = this.state;
    var list = [];
    if (contacts && contacts.length > 0) {
        contacts.forEach(item => {
            if (item.id == c.id) {
                list.push(c);
            } else {
                list.push(item);
            }
        });

        this.setState({contacts: list});
    }
  }

  onAddContact=()=> {
    this.setState({isShowAddContactDialog: true});
  }

  onSelectAddContact=(type)=> {
    this.setState({isShowAddContactDialog: false});
    if (type == 0) {
      this.importContacts();
    } else {
      this.props.navigation.navigate('ContactDetail');
    }
  }

  async importContacts() {
    if (Platform.OS == 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            'title': 'Contacts',
            'message': 'This app would like to view your contacts.',
            'buttonPositive': 'Accept'
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Contacts.getAll((err, contacts) => {
            if (err === 'denied'){
              // error
            } else {
              this.parseContacts(contacts);
            }
          })
        } else {
          this.refs.toast.show("Read Contacts Permission Denied", TOAST_SHOW_TIME);
        }
      }
      catch (err) {
        console.warn(err)
      }
    }
    else {
      Contacts.getAll((err, contacts) => {
        if (err === 'denied'){
          this.refs.toast.show("Read Contacts Permission Denied", TOAST_SHOW_TIME);
        } else {
          this.parseContacts(contacts);
        }
      })
    }
  }

  parseContacts(contacts) {
    this.props.navigation.navigate('ImportContact', {contacts: contacts});
  }

  onSendInvite=(data)=> {
    const { currentUser } = this.props;
    console.log("data:" , data);
    const sender = currentUser.firstName + " " + currentUser.lastName;
    const receiver = data.firstName + " " + data.lastName;

    this.setState({isLoading: true});
    this.props.dispatch({
      type: actionTypes.SEND_INVITE,
      email: data.email,
      sender: sender,
      receiver: receiver
    });
  }

  onSendMessage=(data)=> {
    this.props.navigation.navigate('Chat', {contact: data});
  }

  onSelect=(data)=> {
    this.props.navigation.navigate('ContactDetail', {contact: data});
  }

  showResultMessage(message, isBack) {
    Alert.alert(
      '',
      message,
      [
        {text: 'OK', onPress: () => {
          if (isBack) {
            this.onBack();
          }
        }},
      ]
    );  
  }

  render() {
    const { contacts, keyword, isShowAddContactDialog } = this.state;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: Colors.pageColor}}>
        <View style={styles.container}>
          <HeaderInfoBar 
            title="MY CONTACTS" 
            rightButton="plus"
            onRight={this.onAddContact}
          />
          <View style={{flex: 1}}>
            <View style={styles.contentView}>
              <SearchBox 
                style={{marginTop: 10, marginBottom: 10}} 
                value={keyword} 
                placeholder="Search ..." 
                onChangeText={(text) => this.searchContacts(text)}
              />
              {
                (contacts && contacts.length > 0)
                ?  <FlatList
                    data={contacts}
                    keyExtractor={(item, index) => index.toString()}
                    ListFooterComponent={() => (<View style={{height: 70}}/>)}
                    renderItem={({ item, index }) => (
                      <ContactCell 
                        data={item}
                        onSendInvite={this.onSendInvite}
                        onSendMessage={this.onSendMessage}
                        onSelect={this.onSelect}
                      />
                    )}
                  />
                : <EmptyView title="No contacts."/>

              }
            </View>
          </View>
        </View>
        <AddContactDialog 
          isVisible={isShowAddContactDialog} 
          onClose={() => this.setState({isShowAddContactDialog: false})}
          onSelect={this.onSelectAddContact}
        />
        <Toast ref="toast"/>
        { this.state.isLoading && <LoadingOverlay /> } 
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentView: {
    flex: 1,
    backgroundColor: '#f2f2f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
})

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

function mapStateToProps(state) {
  return {
    currentUser: state.user.currentUser,
    errorMessage: state.user.errorMessage,
    sendInviteStatus: state.user.sendInviteStatus,
  };  
}

export default connect(mapStateToProps,mapDispatchToProps)(ContactListScreen);