import React from 'react';
import ReactDOM from 'react-dom';
//import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import App from './App'; // 导入App组件
/* import About from './components/About'; // 导入About组件
import Inbox from './components/Inbox'; // 导入Inbox组件 */

ReactDOM.render(
  <div>
    <App />
  </div>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
