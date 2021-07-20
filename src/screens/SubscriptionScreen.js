import React, { Component } from 'react';
import {
  Alert,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList
} from 'react-native';

import {connect} from 'react-redux';
import Toast from 'react-native-easy-toast'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';

import TopNavBar from '../components/TopNavBar'
import RoundButton from '../components/RoundButton'
import LoadingOverlay from '../components/LoadingOverlay'
import SubscriptionCell from '../components/Cells/SubscriptionCell'
import actionTypes from '../actions/actionTypes';
import {checkInternetConnectivity} from '../functions'
import {
  TOAST_SHOW_TIME,
  Status,
  SUBSCRIPTION_STANDARD,
  SUBSCRIPTION_PREMIUM,
  USER_LEVEL
} from '../constants.js'

import Messages from '../theme/Messages'
import Colors from '../theme/Colors'
import Fonts from '../theme/Fonts'

const itemSubs = Platform.select({
  ios: [SUBSCRIPTION_STANDARD, SUBSCRIPTION_PREMIUM],
  android: [SUBSCRIPTION_STANDARD, SUBSCRIPTION_PREMIUM]
});

class SubscriptionScreen extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: false,
      isRequestSubscription: false,
      selectedIndex: -1,
      hasLevelAlready: false,
      products: [{
        productId: SUBSCRIPTION_STANDARD,
      },
      {
        productId: SUBSCRIPTION_PREMIUM,
      }],
    }
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser.level == USER_LEVEL.STANDARD) {
      this.setState({selectedIndex: 0, hasLevelAlready: true});
    } else if (currentUser.level == USER_LEVEL.PREMIUM) {
      this.setState({selectedIndex: 1, hasLevelAlready: true});
    }
    this.initIAP();
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    RNIap.endConnection();
  }

  async initIAP() {
    try {
      await RNIap.initConnection();
      this.getSubscriptions();
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  initIAPListener() {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          if (this.state.isRequestSubscription) {
            this.finishTransaction(purchase);
          }
        }
      },
    );

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error) => {
        if (this.state.isRequestSubscription) {
          Alert.alert('Confirm', Messages.SubscriptionCancelled);
        }
        this.setState({isLoading: false, isRequestSubscription: false});
      },
    );
  }

  getSubscriptions = async () => {
    const _SELF = this;
    try {
        _SELF.setState({isLoading: true});
        const products = await RNIap.getSubscriptions(itemSubs);
        _SELF.setState({isLoading: false});
        if (products && products.length > 0) {
          _SELF.setState({products});
        }
        _SELF.initIAPListener();
    }
    catch (err) {
       console.warn(err.code, err.message);
       _SELF.setState({isLoading: false});
       Alert.alert(Messages.NetWorkError, '');
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.changeSubscriptionStatus != this.props.changeSubscriptionStatus) {
      if (this.props.changeSubscriptionStatus == Status.SUCCESS) {
        this.setState({isLoading: false});
        const { hasLevelAlready } = this.state;
        if (hasLevelAlready) {
          this.showMessage(Messages.SuccessChangeMembership, true);
        }
        else {
          this.showMessage(Messages.SubscriptionCompleted, true);
        }
      }
      else if (this.props.changeSubscriptionStatus == Status.FAILURE) {
        this.setState({isLoading: false});
        this.showMessage(Messages.SubscriptionFailed, false);
      }
    }
  }

  onBack() {
    this.props.navigation.goBack();
  }

  onFailure() {
    this.setState({isLoading: false});
    this.toast.show(this.props.errorMessage, TOAST_SHOW_TIME);
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

  finishTransaction(purchase) {
    const { currentUser } = this.props;
    this.setState({isRequestSubscription: false, isLoading: true});
    var level = currentUser.level;
    if (purchase.productId == SUBSCRIPTION_STANDARD) {
      level = USER_LEVEL.STANDARD;
    } else {
      level = USER_LEVEL.PREMIUM;
    }

    this.props.dispatch({
        type: actionTypes.CHANGE_SUBSCRIPTION,
        user_id: currentUser._id,
        level,
        subscription: purchase
    });
  }

  onSubscribe = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      const {selectedIndex, products} = this.state;
      if (products && products.length > 0 && selectedIndex >= 0) {
        const { currentUser } = this.props;
        const level = currentUser.level;
        if (level == USER_LEVEL.FREE) {
          this.requestSubscription(products[selectedIndex].productId);
        }
        else {
          var message = null;
          if (level == USER_LEVEL.STANDARD && selectedIndex == 1) {
            message = Messages.ConfirmStandardToPremium;
          }
          else if (level == USER_LEVEL.PREMIUM && selectedIndex == 0) {
            message = Messages.ConfirmPremiumToStandard;
          }
          if (message == null) {
            this.requestSubscription(products[selectedIndex].productId);
          }
          else {
            Alert.alert(
              'Confirm',
              message,
              [
                {text: 'Yes', onPress: () => {
                  this.requestSubscription(products[selectedIndex].productId);
                }},
                {text: 'No', onPress: () => {}},
              ],
              {cancelable: false},
            );
          }
        }
      }
      else {
        this.setState({subscriptionError: Messages.InvalidSubscription});
      }
    }
    else {
      this.toast.show(Messages.NetWorkError, TOAST_SHOW_TIME);
    }
  }

  requestSubscription = async (sku) => {
    try {
      this.setState({isLoading: true, isRequestSubscription: true});
      await RNIap.requestSubscription(sku);
    } catch (err) {
      this.setState({isLoading: false, isRequestSubscription: false});
    }
  }

  async onRestore() {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      this.setState({isLoading: true});
      try {
        const availablePurchases = await RNIap.getAvailablePurchases();
        this.setState({isLoading: false});
        if (availablePurchases && availablePurchases.length > 0) {
          const sortedAvailablePurchases = availablePurchases.sort(
            (a, b) => b.transactionDate - a.transactionDate
          );
          const latestPurchase = sortedAvailablePurchases[0];
          this.finishTransaction(latestPurchase);
        }
        else {
          var platform = Platform.OS == "ios" ? "Apple" : "Google";
          Alert.alert(
            'No Subscription Restored',
            'We were unable to find an active subscription for your account. Please verify your subscription with ' + platform + ".",
            [
              {text: 'OK', onPress: () => {

              }},
            ],
            {cancelable: false},
          );
        }
      }
      catch (err) {
        this.setState({isLoading: false});
        Alert.alert('Confirm', Messages.SubscriptionCancelled);
      }
    }
    else {
      this.toast.show(Messages.NetWorkError, TOAST_SHOW_TIME);
    }
  }

  render() {
    const { products, selectedIndex, subscriptionError } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: Colors.appColor}}>
        <SafeAreaInsetsContext.Consumer>
          {insets =>
            <View style={{flex: 1, paddingTop: insets.top }} >
              <TopNavBar title="SUBSCRIPTION" align="left" onBack={() => this.onBack()} />
              <View style={styles.container}>
                <FlatList
                  style={styles.listView}
                  data={products}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <SubscriptionCell
                      data={item}
                      key={index}
                      index={index}
                      selectedIndex={selectedIndex}
                      onSelect={(index) => this.setState({selectedIndex: index})}
                    />
                  )}
                />
                <View style={styles.viewBottom}>
                  {
                    (subscriptionError && subscriptionError.length > 0)
                    ? <Text style={styles.errorText}>{subscriptionError}</Text>
                    : null
                  }
                  <RoundButton
                    title="Subscribe"
                    theme="blue"
                    style={styles.registerButton}
                    onPress={this.onSubscribe}
                  />
                  <TouchableOpacity style={styles.restoreBtn} onPress={() => this.onRestore()}>
                    <Text style={styles.restoreBtnText}>Restore</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
        </SafeAreaInsetsContext.Consumer>
        <Toast ref={ref => (this.toast = ref)}/>
        { this.state.isLoading && <LoadingOverlay /> }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  contentView: {
    paddingTop: 30,
    paddingHorizontal: 30,
  },

  viewBottom: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 20,
  },

  listView: {
    paddingTop: 20,
  },

  registerButton: {
    marginTop: 20,
    width: '90%'
  },

  restoreBtn: {
    marginTop: 10,
    marginBottom: 15,
  },

  restoreBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginTop: 5,
  },

  errorText: {
    fontFamily: Fonts.regular,
    fontStyle: 'italic',
    color: '#fc3434',
    fontSize: 11,
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 5,
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
    changeSubscriptionStatus: state.user.changeSubscriptionStatus,
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(SubscriptionScreen);
