var mbr = mbr || {};

(function () {
  // ----------------------- ClassName ----------------------------
  function ClassName (element) {
    this.element = element;
    return this;
  }
  ClassName.prototype.has = function (name) {
    return this.element.classList.contains(name);
    return this;
  }
  ClassName.prototype.add = function () {
    this.element.classList.add.apply(this.element.classList, arguments);
    return this;
  }
  ClassName.prototype.del = function () {
    this.element.classList.remove.apply(this.element.classList, arguments);
    return this;
  }
  ClassName.prototype.toggle = function (name) {
    this.element.classList.toggle(name);
    return this;
  }
  ClassName.prototype.set = function (className) {
    this.element.className = className;
    return this;
  }

  // ----------------------- Handler ----------------------------
  function Handler (dom, eventName, listener) {
    this.dom = dom;
    this.event = eventName;
    this.original = listener;
    this.listener = function () {
      listener.apply(dom, arguments);
    };
  }
  Handler.prototype.add = function () {
    this.dom.dom.addEventListener(this.event, this.listener, false);
  }
  Handler.prototype.remove = function () {
    this.dom.dom.removeEventListener(this.event, this.listener, false);
  }

  // ----------------------- DOM ----------------------------
  function DOM (element, attributes) {
    this.dom = element;
    this.listeners = {};
    this.set(attributes);
  }

  DOM.prototype.append = function () {
    for (var index = 0 ; index < arguments.length ; ++index) {
      if (arguments[index] instanceof DOM) {
        this.dom.appendChild(arguments[index].dom);
      } else if (arguments[index] instanceof HTMLElement) {
        this.dom.appendChild(arguments[index]);
      } else if (typeof arguments[index] === 'string') {
        this.dom.appendChild(document.createTextNode(arguments[index]));
      } else {
        throw new Error('Unsupported element type');
      }
    }

    return this;
  }

  DOM.prototype.appendTo = function (element) {
    if (element instanceof DOM) {
      element.append(this);
    } else if (element instanceof HTMLElement) {
      element.appendChild(this.dom);
    } else {
      throw new Error('Unsupported element type');
    }

    return this;
  }

  DOM.prototype.set = function (attributes) {
    if (attributes) {
      for (var name in attributes) {
        if (attributes[name] instanceof Function) {
          // Handlers
          this.dom[name] = attributes[name].bind(this);
        } else if (attributes[name] instanceof Object) {
          // Inline styles
          for (var subname in attributes[name]) {
            this.dom[name][subname] = attributes[name][subname];
          }
        } else {
          if (name in this.dom) {
            this.dom[name] = attributes[name];
          } else {
            this.dom.setAttribute(name, attributes[name]);
          }
        }
      }
    }

    return this;
  }

  DOM.prototype.remove = function () {
    if (this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
    for (var eventName in this.listeners) {
      for (var index = 0 ; index < this.listeners[eventName].length ; ++index) {
        this.listeners[eventName][index].remove();
      }
    }
  }

  DOM.prototype.clear = function () {
    while (this.dom.lastChild) {
      this.dom.removeChild(this.dom.lastChild);
    }

    return this;
  }

  DOM.prototype.clone = function () {
    return new DOM(this.dom.cloneNode(false));
  }

  DOM.prototype.on = function (listeners) {
    var handler;

    for (var eventName in listeners) {
      handler = new Handler(this, eventName, listeners[eventName]);

      if (this.listeners[eventName]) {
        this.listeners[eventName].push(handler);
      } else {
        this.listeners[eventName] = [handler];
      }

      handler.add();
    }
  }

  DOM.prototype.cn = function (className) {
    className && (this.dom.className = className);

    return new ClassName(this.dom);
  }

  mbr.dom = function (tag, attributes, callback) {
    var docum = this instanceof Window ? this.document : window.document;
    var element = new DOM(docum.createElement(tag), attributes);

    return callback && callback(element) || element;
  }
})();
