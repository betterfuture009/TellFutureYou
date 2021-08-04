import React, { Component } from 'react';
import {
  View, StyleSheet, Text, Image, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import Colors from '../../theme/Colors';
import Fonts from '../../theme/Fonts';
import Images from '../../theme/Images';
import FastImage from 'react-native-fast-image'
import Moment from 'moment';

const win = Dimensions.get('window');

export default class ChannelCell extends React.PureComponent {
  getChannelName(currentUser, channel) {
    const members = channel.members;
    if (members[0].userId === currentUser.userId) {
      if (members.length >= 2) {
        return members[1].nickname;
      }
      else {
        return "";
      }
    } else {
      return members[0].nickname;
    }
  }

  getProfileImage(currentUser, channel) {
    const members = channel.members;
    if (members[0].userId === currentUser.userId) {
      if (members.length >= 2) {
        return members[1].profileUrl;
      } else {
        return '';
      }
    } else {
      return members[0].profileUrl;
    }
  }

  render() {
    const { channel, currentUser, lastSelfMessage, isSelfChannel } = this.props;
    var room = '';
    var message = '';
    var avatar = '';
    var time = '';

    if (isSelfChannel) {
      room = "Saved";
      message = (lastSelfMessage && lastSelfMessage.message) ? lastSelfMessage.message : "";
      if (lastSelfMessage && lastSelfMessage.type && lastSelfMessage.type == "image") {
        message = "[Image]";
      }
      time = (lastSelfMessage && lastSelfMessage.createdAt) ? Moment(lastSelfMessage.createdAt).fromNow(true) : "";
    }
    else if (channel && channel.name) {
      room = this.getChannelName(currentUser, channel);
      const messageType = channel.lastMessage ? channel.lastMessage.data : '';
      if (messageType == 'image') {
        message = '[' + messageType + ']';
      } else {
        message = channel.lastMessage ? channel.lastMessage.message : '';
      }

      avatar = this.getProfileImage(currentUser, channel);
      if (channel.lastMessage) {
        const createdAt = channel.lastMessage ? channel.lastMessage.createdAt : '';
        time = Moment(createdAt).fromNow(true);
      }
    }

    return (
      <TouchableWithoutFeedback onPress={() => this.props.onPress(channel, room)}>
        <View style={styles.listItem}>
          <View style={{flexDirection: 'row', alignItems: 'center', width: '60%'}}>
            {
              isSelfChannel
              ? <Image source={Images.icon_self_room} style={styles.avatarImage} />
              : <FastImage
                  style={styles.avatarImage}
                  source={avatar ? {uri: avatar} : Images.account_icon}
                />
            }
            <View>
              <Text style={channel.unreadMessageCount > 0 ? styles.boldTitleLabel : styles.titleLabel}>{room}</Text>
              <Text style={styles.lastMessageText} numberOfLines={2} ellipsizeMode="tail">{message}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{time}</Text>
          {
            channel.unreadMessageCount > 0
              ? <View style={styles.unreadBadge} />
              : null
          }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}


const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
  },

  avatarImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    resizeMode: 'cover',
    backgroundColor: 'gray',
  }, 

  boldTitleLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    color: Colors.appColor,
  },

  titleLabel: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 17,
    color: 'black',
    width: win.width - 185,
  },

  unreadBadge: {
    position: 'absolute',
    backgroundColor: Colors.appColor,
    width: 10,
    height: 10,
    borderRadius: 5,
    right: 7,
  },


  lastMessageText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
    color: 'gray',
    marginTop: 3,
    width: win.width - 185,
  },

  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'gray',
    marginRight: 20,
  },
});
