import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { Link, BrowserRouter as Router, Route } from "react-router-dom";

const style = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: "10rem"
  }
};

const Home = () => (
  <div style={Object.assign({ backgroundColor: "yellow" }, style.container)}>
    <span style={style.text}>Home</span>
    <Link to="/about">
      <span style={style.text}>About</span>
    </Link>
  </div>
);

const About = () => (
  <div style={Object.assign({ backgroundColor: "orange" }, style.container)}>
    <Link to="/">
      <span style={style.text}>Home</span>
    </Link>
    <span style={style.text}>About</span>
  </div>
);

const Root = () => (
  <Router>
    <Fragment>
      <Route exact path="/" component={Home} />
      <Route exact path="/about" component={About} />
    </Fragment>
  </Router>
);

ReactDOM.render(
  <Root />,
  document.body.appendChild(document.createElement("div"))
);
