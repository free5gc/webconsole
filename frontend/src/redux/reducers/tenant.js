import actions from '../actions/tenantActions';

const initialState = {
  tenants: [],
  tenantsMap: {}
};

export default function reducer(state = initialState, action) {
  let nextState = {...state};

  switch (action.type) {
    case actions.SET_TENANTS:
      nextState.tenants = action.tenants;
      nextState.tenantsMap = createTenantsMap(action.tenants);
      return nextState;

    default:
      return state;
  }
}

function createTenantsMap(tenants) {
  let tenantsMap = {};
  tenants.forEach(tenants => tenantsMap[tenants['id']] = tenants);
  return tenantsMap;
}
