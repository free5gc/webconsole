import actions from '../actions/userActions';

const initialState = {
  users: [],
  usersMap: {}
};

export default function reducer(state = initialState, action) {
  let nextState = {...state};

  switch (action.type) {
    case actions.SET_USERS:
      nextState.users = action.users;
      nextState.usersMap = createUsersMap(action.users);
      return nextState;

    default:
      return state;
  }
}

function createUsersMap(users) {
  let usersMap = {};
  users.forEach(users => usersMap[users['id']] = users);
  return usersMap;
}
