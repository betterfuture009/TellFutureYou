import { url } from '../constants';

export const getUnreadNumber = (user_id) => {
  const method = 'POST';
  const request_url = `${url}/notification/get_unread_number`
  const headers = {
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({ 
    user_id,
  });

  return fetch(request_url, { method, body, headers})
    .then((res) => res.json());
};

export const createNotification = (notification) => {
  const method = 'POST';
  const request_url = `${url}/notification/create_notification`
  const headers = {
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({ 
    creator: notification.creator,
    receiver: notification.receiver,
    job: notification.job,
    type: notification.type,
  });
  return fetch(request_url, { method, body, headers})
    .then((res) => res.json());
};

export const getMyNofications = (user_id) => {
  const method = 'POST';
  const request_url = `${url}/notification/get_my_notifications`
  const headers = {
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({ 
    user_id
  });

  return fetch(request_url, { method, body, headers})
  .then((response) => response.json())
};

export const markReadNotification = (notification_id) => {
  const method = 'POST';
  const request_url = `${url}/notification/mark_read_notification`
  const headers = {
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({ 
    notification_id
  });

  return fetch(request_url, { method, body, headers})
    .then((res) => res.json());
};