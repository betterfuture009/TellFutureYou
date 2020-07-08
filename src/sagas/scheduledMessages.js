import {
    put, call, takeLatest, select,
} from 'redux-saga/effects';
import Types from '../actions/actionTypes';
import api from '../api';
import Messages from '../theme/Messages'
  
const {
    getScheduledMessages,
    createScheduledMessage,
} = api;
  
function* GetScheduledMessages(action) {
    yield put({ type: Types.GET_SCHEDULED_MESSAGES_REQUEST });
    try {
      const res = yield call(getScheduledMessages, action.userId, action.channelId);
      if (res.result) {
        yield put({ type: Types.GET_SCHEDULED_MESSAGES_SUCCESS, payload: res.messages });
      } else {
        yield put({ type: Types.GET_SCHEDULED_MESSAGES_FAILURE, error: res.error });      
      }
    } catch (error) {
      yield put({ type: Types.GET_SCHEDULED_MESSAGES_FAILURE, error: Messages.NetWorkError });
      console.log(error);
    }
}
 
function* CreateScheduledMessage(action) {
    yield put({ type: Types.CREATE_SCHEDULED_MESSAGE_REQUEST });
    try {
      const res = yield call(createScheduledMessage, action.data);
      if (res.result) {
        yield put({ type: Types.CREATE_SCHEDULED_MESSAGE_SUCCESS, payload: res.data });
      } else {
        yield put({ type: Types.CREATE_SCHEDULED_MESSAGE_FAILURE, error: res.error });      
      }
    } catch (error) {
      yield put({ type: Types.CREATE_SCHEDULED_MESSAGE_FAILURE, error: Messages.NetWorkError });
      console.log(error);
    }
}

export default [
    takeLatest(Types.GET_SCHEDULED_MESSAGES, GetScheduledMessages),
    takeLatest(Types.CREATE_SCHEDULED_MESSAGE, CreateScheduledMessage),
];