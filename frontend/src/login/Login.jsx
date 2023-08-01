import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux';

import Free5gcLogo from "../_assets/images/free5gc_logo.png";
import { history } from '../_helpers';
import { authActions, store } from '../_store';

export { Login };

function Login() {
  const { token, error: authError } = useSelector(x => x.auth);

  useEffect(() => {
    // redirect to home if already logged in
    if (token) history.navigate('/');

  }, [ token ]);

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm();
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data, e) => {
    e.preventDefault();
    store.dispatch(authActions.login(data));
  }

  return (
    <div className="Login">
      <div className="LoginForm">
        <img src={Free5gcLogo} alt="free5GC" />
        <h4 className="card-header">Login</h4>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username" 
                type="text" 
                {...register('username')} 
                className={`form-control ${errors.username ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.username?.message}</div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
              name="password" 
              type="password" 
              {...register('password')} 
              className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
              <div className="invalid-feedback">{errors.password?.message}</div>
            </div>
            <button disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
              Login
            </button>
            {authError &&
              <div className="alert alert-danger mt-3 mb-0">{authError.message}</div>
            }
          </form>
        </div>
      </div>
    </div>
  )
}
