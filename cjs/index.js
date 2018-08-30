'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = {};
var imgPropTypes = {
  loader: _propTypes.node,
  unloader: _propTypes.node,
  decode: _propTypes.bool,
  src: (0, _propTypes.oneOfType)([_propTypes.string, _propTypes.array]),
  container: _propTypes.func
};

if ('production' != 'production') {
  imgPropTypes.containermockImage = (0, _propTypes.instanceOf)(Image); //used for testing only
}

var Img = function (_Component) {
  (0, _inherits3.default)(Img, _Component);

  function Img(props) {
    (0, _classCallCheck3.default)(this, Img);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Img.__proto__ || (0, _getPrototypeOf2.default)(Img)).call(this, props));

    _this.srcToArray = function (src) {
      return (Array.isArray(src) ? src : [src]).filter(function (x) {
        return x;
      });
    };

    _this.onLoad = function () {
      cache[_this.sourceList[_this.state.currentIndex]] = true;
      /* istanbul ignore else */
      if (_this.i) _this.setState({ isLoaded: true });
    };

    _this.onError = function () {
      cache[_this.sourceList[_this.state.currentIndex]] = false;
      // if the current image has already been destroyed, we are probably no longer mounted
      // no need to do anything then
      /* istanbul ignore else */
      if (!_this.i) return false;

      // before loading the next image, check to see if it was ever loaded in the past
      for (var nextIndex = _this.state.currentIndex + 1; nextIndex < _this.sourceList.length; nextIndex++) {
        // get next img
        var src = _this.sourceList[nextIndex];

        // if we have never seen it, its the one we want to try next
        if (!(src in cache)) {
          _this.setState({ currentIndex: nextIndex });
          break;
        }

        // if we know it exists, use it!
        if (cache[src] === true) {
          _this.setState({
            currentIndex: nextIndex,
            isLoading: false,
            isLoaded: true
          });
          return true;
        }

        // if we know it doesn't exist, skip it!
        /* istanbul ignore else */
        if (cache[src] === false) continue;
      }

      // currentIndex is zero bases, length is 1 based.
      // if we have no more sources to try, return - we are done
      if (nextIndex === _this.sourceList.length) return _this.setState({ isLoading: false });

      // otherwise, try the next img
      _this.loadImg();
    };

    _this.loadImg = function () {
      if ('production' != 'production') {
        _this.i = _this.props.mockImage || new Image();
      } else {
        _this.i = new Image();
      }
      _this.i.src = _this.sourceList[_this.state.currentIndex];

      if (_this.props.decode && _this.i.decode) {
        _this.i.decode().then(_this.onLoad).catch(_this.onError);
      } else {
        _this.i.onload = _this.onLoad;
      }

      _this.i.onerror = _this.onError;
    };

    _this.unloadImg = function () {
      delete _this.i.onerror;
      delete _this.i.onload;
      try {
        delete _this.i.src;
      } catch (e) {
        // On Safari in Strict mode this will throw an exception,
        //  - https://github.com/mbrevda/react-image/issues/187
        // We don't need to do anything about it.
      }
      delete _this.i;
    };

    _this.sourceList = _this.srcToArray(_this.props.src);

    // check cache to decide at which index to start
    for (var i = 0; i < _this.sourceList.length; i++) {
      // if we've never seen this image before, the cache wont help.
      // no need to look further, just start loading
      /* istanbul ignore else */
      if (!(_this.sourceList[i] in cache)) break;

      // if we have loaded this image before, just load it again
      /* istanbul ignore else */
      if (cache[_this.sourceList[i]] === true) {
        var _ret;

        _this.state = { currentIndex: i, isLoading: false, isLoaded: true };
        return _ret = true, (0, _possibleConstructorReturn3.default)(_this, _ret);
      }
    }

    _this.state = _this.sourceList.length ? // 'normal' opperation: start at 0 and try to load
    { currentIndex: 0, isLoading: true, isLoaded: false } : // if we dont have any sources, jump directly to unloaded
    { isLoading: false, isLoaded: false };
    return _this;
  }

  (0, _createClass3.default)(Img, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // kick off process
      /* istanbul ignore else */
      if (this.state.isLoading) this.loadImg();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // ensure that we dont leave any lingering listeners
      /* istanbul ignore else */
      if (this.i) this.unloadImg();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      var src = this.srcToArray(nextProps.src);

      var srcAdded = src.filter(function (s) {
        return _this2.sourceList.indexOf(s) === -1;
      });
      var srcRemoved = this.sourceList.filter(function (s) {
        return src.indexOf(s) === -1;
      });

      // if src prop changed, restart the loading process
      if (srcAdded.length || srcRemoved.length) {
        this.sourceList = src;

        // if we dont have any sources, jump directly to unloader
        if (!src.length) return this.setState({ isLoading: false, isLoaded: false });
        this.setState({ currentIndex: 0, isLoading: true, isLoaded: false }, this.loadImg);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      // set img props as rest
      var _props = this.props,
          src = _props.src,
          loader = _props.loader,
          unloader = _props.unloader,
          decode = _props.decode,
          container = _props.container,
          mockImage = _props.mockImage,
          rest = (0, _objectWithoutProperties3.default)(_props, ['src', 'loader', 'unloader', 'decode', 'container', 'mockImage']); //eslint-disable-line

      // if we have loaded, show img

      if (this.state.isLoaded) {
        var imgProps = (0, _assign2.default)({ src: this.sourceList[this.state.currentIndex] }, rest);

        return container(_react2.default.createElement('img', imgProps), 0);
      }

      // if we are still trying to load, show img and a loader if requested
      if (!this.state.isLoaded && this.state.isLoading) {
        return loader ? container(this.props.loader, 1) : null;
      }

      // if we have given up on loading, show a place holder if requested, or nothing
      /* istanbul ignore else */
      if (!this.state.isLoaded && !this.state.isLoading) {
        return unloader ? container(this.props.unloader, -1) : null;
      }
    }
  }]);
  return Img;
}(_react.Component);

Img.defaultProps = {
  loader: false,
  unloader: false,
  decode: true,
  src: [],
  // by default, just return what gets sent in. Can be used for advanced rendering
  // such as animations
  container: function container(x) {
    return x;
  }
};
Img.propTypes = 'production' !== "production" ? imgPropTypes : {};
exports.default = Img;