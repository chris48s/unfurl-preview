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
    const endpoint = process.env.REACT_APP_API_ENDPOINT;
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
          <UrlInput />
        </header>

        <main>
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


    const description = (data.ogp && data.ogp.ogDescription)
      || (data.other && data.other.description);
    const authorName = data.ogp && data.ogp.ogSiteName;
    const authorIcon = data.other && data.other.icon;
    const title = (data.ogp && data.ogp.ogTitle)
      || (data.other && data.other.title && data.other.title.trim());
    const titleLink = (data.ogp && data.ogp.ogUrl) || url;
    const thumbUrl =
      (data.ogp && data.ogp.ogImage && data.ogp.ogImage[0] && data.ogp.ogImage[0].url)
      || (data.other && data.other.shortcutIcon);


    return (
      <blockquote>
        { thumbUrl && <img src={thumbUrl} width="100px" align="right" alt="thumbnail" /> }
        { authorName &&
          <p>
            { authorIcon && <img src={authorIcon} height="14" alt="author icon" /> }
            { authorIcon && ' ' }
            {authorName}
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
