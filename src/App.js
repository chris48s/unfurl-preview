import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { HashRouter, StaticRouter, Route } from 'react-router-dom';


function prependHttp(url) {
  url = url.trim();

  if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
    return url;
  }

  return url.replace(/^(?!(?:\w+:)?\/\/)/, 'http://');
}


class App extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      url: null,
      error: null,
      data: null,
    };

    this.unfurl = this.unfurl.bind(this);
    if (this.props.match.params.url) {
      this.unfurl(decodeURIComponent(this.props.match.params.url));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.url !== prevProps.match.params.url) {
      this.unfurl(decodeURIComponent(this.props.match.params.url));
    }
  }

  unfurl(url) {
    const endpoint = '/api';
    axios.get(endpoint, {
      params: { url: prependHttp(url) }
    })
      .then(
        function(res) {
          this.setState({
            url: url,
            error: null,
            data: res.data,
          });
        }.bind(this)
      )
      .catch(
        function(e) {
          this.setState({
            url: url,
            error: e,
            data: {},
          });
        }.bind(this)
      );
  }

  render() {
    return (
      <div>
        <header>
          <h1>Unfurl Preview</h1>
        </header>

        <main>
          <UrlInput />
          <DefaultUnfurl
            url={this.state.url}
            data={this.state.data}
            error={this.state.error}
          />
        </main>
      </div>
    );
  }
}
App.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      url: PropTypes.string,
    })
  })
};


class Router extends React.Component {
  render() {
    const router = (
      <div>
        <Route path="/" exact component={App} />
        <Route path="/:url" component={App} />
      </div>
    );

    if (typeof window !== 'undefined') {
      return (<HashRouter>{ router }</HashRouter>);
    } else {
      const context = {};
      return (
        <StaticRouter context={context} basename="#">
          { router }
        </StaticRouter>
      );
    }
  }
}


class BaseUrlInput extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      url: undefined,
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInput(event) {
    this.setState({ url: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.url) {
      this.props.history.push('/' + encodeURIComponent(this.state.url));
    }
  }

  render() {
    const inputStyle = {
      marginRight: '1em'
    };
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input style={inputStyle} type="text" name="url" size="36"
            onChange={this.handleInput}
          />
          <input type="submit" value="unfurl" />
        </form>
      </div>
    );
  }

}
BaseUrlInput.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};
const UrlInput = withRouter(BaseUrlInput);


class DefaultUnfurl extends Component {

  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const url = this.props.url;
    const data = this.props.data;
    const error = this.props.error;
    if (!data) return (null);
    if (error) return (<div>{error.message}</div>);


    const description = data.description || (data.open_graph && data.open_graph.description);
    const authorName = (data.open_graph && data.open_graph.site_name);
    const authorIcon = data.favicon;
    const title = data.title.trim() || (data.open_graph && data.open_graph.title);
    const titleLink = (data.open_graph && data.open_graph.url) || url;
    const thumbUrl =
      data.open_graph &&
      data.open_graph.images &&
      data.open_graph.images[0] &&
      data.open_graph.images[0].url;


    return (
      <blockquote>
        { thumbUrl && <img src={thumbUrl} width="100px" align="right" alt="thumbnail" /> }
        { authorName &&
          <p>
            { authorIcon && <img src={authorIcon} height="14" alt="author icon" /> }
            { authorIcon && ' ' }
            { authorName }
          </p>
        }
        { title &&
          <p><strong>
            { titleLink ? <a href={titleLink}>{title}</a> : title }
          </strong></p>
        }
        { description && <p>{description}</p> }
      </blockquote>
    );
  }
}
DefaultUnfurl.propTypes = {
  url: PropTypes.string,
  data: PropTypes.object,
  error: PropTypes.object,
};


export default Router;
