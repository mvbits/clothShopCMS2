import { fakeAccountLogin, loginCMS } from '../services/api';
import { setAuthority } from '../utils/authority';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      // alert(" login payload: " + JSON.stringify(payload))
      // const response = yield call(fakeAccountLogin, payload);
      const response = yield call(loginCMS, payload.userName, payload.password);
      response.currentAuthority = 'user';
      response.type = 'account';
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      // if (response.status === 'ok') {
      if (response.statusCode === 200) {
        // 非常粗暴的跳转,登陆成功之后权限会变成user或admin,会自动重定向到主页
        // Login success after permission changes to admin or user
        // The refresh will automatically redirect to the home page
        // yield put(routerRedux.push('/'));
        window.location.reload();
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        // yield put(routerRedux.push('/user/login'));
        // Login out after permission changes to admin or user
        // The refresh will automatically redirect to the login page
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        window.location.reload();
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      console.log("changeLoginStatus payload: " + JSON.stringify(payload))
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};