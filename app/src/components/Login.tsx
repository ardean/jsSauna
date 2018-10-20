import * as React from "react";

export default class Login extends React.Component {
  render() {
    return (
      <div className="container login">
        <h1>jsSauna</h1>
        <h3>Login</h3>
        <form className="login-form">
          <div className="row">
            <input type="text" placeholder="Username" autoComplete="username" className="login-username" id="login-username" />
          </div>
          <div className="row">
            <input type="password" placeholder="Password" autoComplete="current-password" className="login-pw" id="login-pw" />
          </div>
          <div className="row">
            <div className="login-error" />
          </div>
          <div className="row">
            <button className="login-submit" type="submit">Login</button>
          </div>
        </form>
      </div>
    );
  }
}