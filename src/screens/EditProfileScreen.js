import React, { Component } from 'react';
import {
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  Keyboard
} from 'react-native';

import {connect} from 'react-redux';
import SendBird from 'sendbird';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from 'react-native-actionsheet'
import Toast from 'react-native-easy-toast'
import TopNavBar from '../components/TopNavBar'
import RoundButton from '../components/RoundButton'
import LabelFormInput from '../components/LabelFormInput'
import EditAvatar from '../components/EditAvatar'
import Colors from '../theme/Colors'
import LoadingOverlay from '../components/LoadingOverlay'
import Messages from '../theme/Messages'
import { TOAST_SHOW_TIME, Status } from '../constants.js'
import actionTypes from '../actions/actionTypes';
import {validateEmail, getOnlyAlphabetLetters} from '../functions'

var sb = null;

class EditProfile extends Component {
  constructor() {
    super()
    this.state = {
      id: '',
      avatar: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',

      firstNameError: '',
      lastNameError: '',
      emailError: '',
      phoneError: '',
      isLoading: false,
    }
  }

  componentDidMount() {
    sb = SendBird.getInstance();

    if (this.props.currentUser) {
      const { currentUser } = this.props;
      this.setState({
        id: currentUser._id,
        avatar: currentUser.avatar,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.updateProfileStatus != this.props.updateProfileStatus) {
      if (this.props.updateProfileStatus == Status.SUCCESS) {
        this.setState({isLoading: false});

        // Update Sendbird.
        const { currentUser } = this.props;
        const username = currentUser.firstName + " " + currentUser.lastName;
        var profileUrl = '';
        if (currentUser.avatar && currentUser.avatar.length > 0) {
          profileUrl = currentUser.avatar;
        }
        if (sb && sb.currentUser) {
          sb.updateCurrentUserInfo(username, profileUrl, function(response, error) {
          });
        }


        this.showMessage("Profile has been updated successfully!", true);
      } else if (this.props.updateProfileStatus == Status.FAILURE) {
        this.onFailure(this.props.errorMessage);
      }
    }
  }

  showMessage(message, isBack) {
    Alert.alert(
      '',
      message,
      [
        {text: 'OK', onPress: () => {
          if (isBack) this.onBack();
        }},
      ],
      {cancelable: false},
    );
  }

  onFailure(message) {
    if (!(message && message.length > 0)) {
      message = Messages.NetWorkError;
    }
    this.setState({isLoading: false});
    this.toast.show(message, TOAST_SHOW_TIME);
  }

  onSelectedItemsChange = selectedItems => {
    this.setState({ services: selectedItems, servicesError: null });
  };

  onBack() {
    this.props.navigation.goBack();
  }

  onMakeChanges() {
    Keyboard.dismiss();
    const { currentUser } = this.props;
    var isValid = true;
    const {
      firstName,
      lastName,
      email,
      phone,
      avatarFile
    } = this.state;

    if (firstName == null || firstName.length == 0) {
      this.setState({firstNameError: Messages.InvalidFirstname});
      isValid = false;
    }

    if (lastName == null || lastName.length == 0) {
      this.setState({lastNameError: Messages.InvalidLastname});
      isValid = false;
    }

    if (email == null || email.length == 0 || !validateEmail(email)) {
      this.setState({emailError: Messages.InvalidEmail});
      isValid = false;
    }

    if (phone == null || phone.length == 0) {
      this.setState({phoneError: Messages.InvalidPhone});
      isValid = false;
    }

    if (isValid) {
      this.setState({isLoading: true}, () => {
        this.updateProfileData();
      });
    }
  }

  updateProfileData() {
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      avatarFile,
    } = this.state;

    let user = {
      id,
      firstName,
      lastName,
      email,
      phone,
      avatarFile,
    };

    this.props.dispatch({
      type: actionTypes.UPDATE_PROFILE,
      user: user,
    });
  }

  onTakePicture() {
    this.ActionSheet.show();
  }

  async onSelectMedia(index) {
    try {
      if (Platform.OS == "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.openImagePicker(index);
        }
        else {
          console.log("Camera permission denied");
        }
      }
      else {
        this.openImagePicker(index);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  openImagePicker(index) {
    const options = {
			mediaType: 'photo',
		};

		if (index == 0) {
			launchCamera(options, (response) => {
				if (response.didCancel) {
				  console.log('User cancelled image picker');
				} else if (response.error) {
				  console.log('ImagePicker Error: ', response.error);
				} else {
				  if (response && response.assets.length > 0) {
					this.addPhoto(response.assets[0]);
				  }
				}
			});
		}
		else if (index == 1) {
			launchImageLibrary(options, (response) => {
				if (response.didCancel) {
				  console.log('User cancelled image picker');
				} else if (response.error) {
				  console.log('ImagePicker Error: ', response.error);
				} else {
				  if (response && response.assets.length > 0) {
                    this.addPhoto(response.assets[0]);
                  }
				}
			});
		}
  }

  addPhoto(response) {
    console.log("add photo =====>", response);
    this.setState({
      avatar: response.uri,
      avatarFile: response
    });
  }

  filterData(data) {
    var response = [];
    for (var i = 0; i < data.length; i++) {
      const item = data[i];
      response.push({
        id: item._id,
        label: item.name,
        value: item.name
      });
    }

    return response;
  }

  onChangeFirstName =(text)=> {
    const name = getOnlyAlphabetLetters(text);
    this.setState({firstName: name, firstNameError: null});
  }

  onChangeLastName =(text)=> {
    const name = getOnlyAlphabetLetters(text);
    this.setState({lastName: name, lastNameError: null});
  }

  onChangeEmail =(text)=> {
    if (validateEmail(text)) {
      this.setState({email: text, emailError: null})
    } else {
      this.setState({email: text})
    }
  }

  render() {
    const { currentUser } = this.props;
    const socialType = (currentUser && currentUser.socialType) ? currentUser.socialType : '';
    var editable = true;
    if (socialType && socialType.length > 0) {
      editable = false;
    }

    return (
      <View style={{flex: 1, backgroundColor: Colors.appColor}}>
        <SafeAreaInsetsContext.Consumer>
          {insets =>
            <View style={{flex: 1, paddingTop: insets.top }} >
              <TopNavBar title="EDIT PROFILE" onBack={() => this.onBack()}/>
                <View style={styles.container}>
                  <KeyboardAwareScrollView>
                    <View>
                      <View style={styles.profileBox}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <EditAvatar avatar={this.state.avatar} style={{ marginTop: -80}} onTakePhoto={() => this.onTakePicture()} />
                        </View>
                        <View style={[styles.rowView, {marginTop: 25}]}>
                          <LabelFormInput
                            label="First Name"
                            type="text"
                            editable={true}
                            placeholderTextColor={Colors.placeholderTextColor}
                            value={this.state.firstName}
                            errorMessage={this.state.firstNameError}
                            style={{width: '45%'}}
                            returnKeyType="next"
                            onSubmitEditing={() => { this.lastNameInput.focus() }}
                            onChangeText={this.onChangeFirstName}
                          />

                          <LabelFormInput
                            label="Last Name"
                            type="text"
                            editable={true}
                            placeholderTextColor={Colors.placeholderTextColor}
                            value={this.state.lastName}
                            errorMessage={this.state.lastNameError}
                            style={{width: '45%'}}
                            returnKeyType="next"
                            onRefInput={(input) => { this.lastNameInput = input }}
                            onSubmitEditing={() => { this.emailInput.focus() }}
                            onChangeText={this.onChangeLastName}
                          />
                        </View>

                        <LabelFormInput
                          label="Email"
                          type="email"
                          editable={editable}
                          autoCapitalize={false}
                          placeholderTextColor={Colors.placeholderTextColor}
                          value={this.state.email}
                          errorMessage={this.state.emailError}
                          returnKeyType="next"
                          onRefInput={(input) => { this.emailInput = input }}
                          onSubmitEditing={() => { this.phoneInput.focus() }}
                          onChangeText={this.onChangeEmail}
                        />

                        <LabelFormInput
                          label="Phone"
                          type="phone"
                          editable={true}
                          placeholderTextColor={Colors.placeholderTextColor}
                          value={this.state.phone}
                          errorMessage={this.state.phoneError}
                          returnKeyType="next"
                          onRefInput={(input) => { this.phoneInput = input }}
                          onSubmitEditing={() => { this.onMakeChanges() }}
                          onChangeText={(text) => this.setState({phone: text, phoneError: null})}
                        />

                        <View style={styles.centerView}>
                          <RoundButton
                            title="Save Changes"
                            theme="blue"
                            style={styles.blueButton}
                            onPress={() => this.onMakeChanges()} />
                        </View>
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                </View>
              </View>
            }
          </SafeAreaInsetsContext.Consumer>
          <ActionSheet
            ref={o => this.ActionSheet = o}
            title={'Select Image'}
            options={['Camera', 'Photo Library', 'Cancel']}
            cancelButtonIndex={2}
            onPress={(index) => this.onSelectMedia(index)}
          />
          <Toast ref={ref => (this.toast = ref)}/>
          { this.state.isLoading && <LoadingOverlay /> }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageColor,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  centerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },

  blueButton: {
    width: '100%'
  },

  profileBox: {
    flex: 1,
    marginTop: 76,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingLeft: 22,
    paddingRight: 22,
    paddingTop: 25,
    paddingBottom: 10,
    borderRadius: 10,
  },

  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
})

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

function mapStateToProps(state) {
  return {
    currentUser: state.user.currentUser,
    updateProfileStatus: state.user.updateProfileStatus,
    errorMessage: state.user.errorMessage,
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(EditProfile);
