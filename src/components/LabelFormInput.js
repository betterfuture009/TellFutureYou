import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, Image, Platform, Dimensions, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-datepicker'
import { GoogleAutoComplete } from 'react-native-google-autocomplete';
import Colors from '../theme/Colors'
import Fonts from '../theme/Fonts'
import Images from '../theme/Images';
import LocationItem from './LocationItem';
import { GOOGLE_API_KEY } from '../constants.js'

const win = Dimensions.get('window');
class LabelFormInput extends Component {

    constructor() {
        super()
        this.state = {
          showAddressList: false
        }
    }

    render() {
        const {
            type,
            label,
            value,
            maxLength,
            autoCapitalize,
            placeholder,
            placeholderTextColor,
            onChangeText,
            onRefInput,
            returnKeyType,
            onSubmitEditing,
            editable
        } = this.props;

        return (
            <View style={
                [
                    this.props.style,
                    (type == "textview" || type == "address") ? styles.containerTextView : styles.container]
            }>
                <View>
                <Text style={styles.labelText}>{label}</Text>
                {
                    (type === "text")
                    ? <TextInput
                        style={[styles.textInput, editable ? {} : styles.disabledTextInput]}
                        placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                        underlineColorAndroid='transparent'
                        onChangeText={onChangeText}
                        value={value}
                        autoCapitalize={autoCapitalize}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        editable={editable}
                        ref={onRefInput}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                    />
                    : null
                }
                {
                    (type === "phone")
                    ? <TextInput
                        style={[styles.textInput, editable ? {} : styles.disabledTextInput]}
                        placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                        underlineColorAndroid='transparent'
                        keyboardType='phone-pad'
                        maxLength={maxLength}
                        autoCapitalize={autoCapitalize}
                        onChangeText={onChangeText}
                        value={value}
                        placeholder={placeholder}
                        editable={editable}
                        ref={onRefInput}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                    />
                    : null
                }
                {
                    (type === "number")
                    ? <TextInput
                        style={[styles.textInput, editable ? {} : styles.disabledTextInput]}
                        keyboardType={'numeric'}
                        placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                        underlineColorAndroid='transparent'
                        onChangeText={onChangeText}
                        value={value}
                        autoCapitalize={autoCapitalize}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        editable={editable}
                        ref={onRefInput}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                    />
                    : null
                }
                {
                    (type === "email")
                    ? <TextInput
                        autoCapitalize='none'
                        keyboardType={'email-address'}
                        autoCorrect={false}
                        // autoCapitalize={autoCapitalize}
                        style={[styles.textInput, editable ? {} : styles.disabledTextInput]}
                        placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                        underlineColorAndroid='transparent'
                        onChangeText={onChangeText}
                        value={value}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        editable={editable}
                        ref={onRefInput}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                    />
                    : null
                }

                {
                    (type === "password")
                        ?<TextInput
                            secureTextEntry={true}
                            autoCapitalize='none'
                            autoCorrect={false}
                            autoCapitalize={autoCapitalize}
                            style={[styles.textInput, editable ? {} : styles.disabledTextInput]}
                            placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                            underlineColorAndroid='transparent'
                            onChangeText={onChangeText}
                            value={value}
                            maxLength={maxLength}
                            placeholder={placeholder}
                            editable={editable}
                            ref={onRefInput}
                            returnKeyType={returnKeyType}
                            onSubmitEditing={onSubmitEditing}
                        />
                        : null
                }
                {
                    (type === "address")
                    ? <GoogleAutoComplete apiKey={GOOGLE_API_KEY} debounce={300} queryTypes="address">
                          {({ inputValue, handleTextChange, locationResults, fetchDetails }) => (
                            <React.Fragment>
                              <TextInput
                                value={value}
                                onChangeText={(text) => {
                                    handleTextChange(text);
                                    onChangeText(text);
                                }}
                                autoCapitalize={autoCapitalize}
                                returnKeyType={returnKeyType}
                                onSubmitEditing={onSubmitEditing}
                                onFocus={ () => this.setState({showAddressList: true}) }
                                ref={onRefInput}
                                maxLength={maxLength}
                                style={{
                                    fontFamily: Fonts.regular,
                                    height: 50,
                                    borderWidth: 1,
                                    borderColor: '#e4e8ea',
                                    borderRadius: 25,
                                    marginTop: 10,
                                    paddingHorizontal: 15,
                                    fontSize: 16,
                                    color: 'black',
                                }}
                              />
                              {
                                this.state.showAddressList && this.props.value.length > 0
                                ? <ScrollView style={{ maxHeight: 150 }}>
                                    {locationResults.map((el, i) => (
                                      <LocationItem
                                        {...el}
                                        fetchDetails={fetchDetails}
                                        key={String(i)}
                                        theme="black"
                                        onSelectAddress={(address) => {
                                            this.setState({showAddressList: false});
                                            this.props.onChangeText(address)
                                            this.props.onSelectAddress(address)
                                        }}
                                      />
                                    ))}
                                  </ScrollView>
                                : null
                              }

                            </React.Fragment>
                          )}
                        </GoogleAutoComplete>
                    : null
                }
                {
                    (type === "dropdown")
                    ? <View style={[styles.boxContainer, Platform.OS === 'ios' ? { paddingVertical: 15, paddingLeft: 15 } : { }]}>
                        <RNPickerSelect
                            style={{
                                ...pickerSelectStyles,
                                iconContainer: {
                                    top: Platform.OS === 'ios' ? 6 : 20,
                                    right: 12,
                                },
                            }}
                            value={value}
                            ref={onRefInput}
                            onValueChange={(value) => onChangeText(value)}
                            items={this.props.data}
                            Icon={() => {
                            return <Image
                                    style={styles.dropdownIcon}
                                    source={Images.dropdown_icon}
                                    />;
                            }}
                        />
                    </View>
                    : null
                }

                {
                    (type === "textview")
                    ? <TextInput
                        style={styles.textView}
                        placeholderTextColor={placeholderTextColor ? placeholderTextColor : "#fff"}
                        underlineColorAndroid='transparent'
                        numberOfLines={6}
                        autoCapitalize={autoCapitalize}
                        maxLength={maxLength}
                        multiline={true}
                        onChangeText={onChangeText}
                        value={value}
                        placeholder={placeholder}
                        editable={editable}
                        ref={onRefInput}
                        returnKeyType={returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                    />
                    : null
                }

                {
                    (this.props.type == "datepicker")
                    ? <DatePicker
                        style={{
                            width: '100%', borderWidth: 1, borderColor: '#e4e8ea', borderRadius: 25, paddingHorizontal: 15, marginTop: 10, height: 50, paddingTop: 3,
                        }}
                        customStyles={{
                          dateInput: {
                            borderWidth: 0,
                            paddingTop: 5,
                            paddingBottom: 5,
                            alignItems: 'flex-start'
                          },

                          dateText:{
                            fontFamily: Fonts.regular,
                            fontSize: 16,
                            color: '#000'
                          }
                        }}
                        showIcon={false}
                        date={this.props.value}
                        mode="date"
                        placeholder=""
                        format="MMM DD, YYYY"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        onDateChange={(date) => this.props.onChangeText(date)}
                        onDonePress={() => console.log("Done")}
                      />
                    : null
                }
                </View>
                {
                    this.props.errorMessage
                    ? <Text style={styles.errorMessage}>{this.props.errorMessage}</Text>
                    : null
                }
            </View>
        );
    }
}

export default LabelFormInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },

    containerTextView: {
        marginBottom: 30,
    },

    containerError: {
        borderBottomColor: '#ed0a3f',
    },

    labelText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#a7a7a7',
        marginLeft: 5,
    },

    textInput: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        height: 50,
        borderWidth: 1,
        borderColor: '#e4e8ea',
        borderRadius: 25,
        marginTop: 10,
        paddingHorizontal: 15,
        color: 'black',
    },

    textView: {
        padding: 7,
        height: 105,
        borderWidth: 1,
        borderColor: '#e4e8ea',
        marginTop: 16,
        borderRadius: 15,
        color: 'black',
        paddingTop: 10,
        paddingHorizontal: 10,
        textAlignVertical: "top",
        fontSize: 16,
    },

    formField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dropdownBox: {
        height: 42,
        backgroundColor: 'red',
    },

    dropdownIcon: {
        width: 17,
        height: 10,
    },
    errorMessage: {
        fontFamily: Fonts.regular,
        fontStyle: 'italic',
        color: 'red',
        fontSize: 11,
        marginTop: 4,
        marginLeft: 4,
    },

    boxContainer: {
        borderWidth: 1,
        borderColor: '#e4e8ea',
        paddingLeft: 10,
        paddingRight: 0,
        borderRadius: 25,
        marginTop: 10,
    },

    disabledTextInput: {
        backgroundColor: 'lightgray',
        color: 'gray'
    }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'black',
    zIndex: 10,
    paddingRight: 15,
  },
  inputAndroid: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: 'black',
    zIndex: 10,
  },
});
