let Vue;

export class Navigator {
  constructor(options = {}) {
    if (!Vue) {
      throw new Error(
        '[Navigation] must call Vue.use(Navigation) before creating Navigator instance.',
      );
    }

    this._screens = options.screens ? options.screens : [];

    this._before = options.before
      ? options.before
      : () => {
          return null;
        };

    this._vm = new Vue({
      data: function () {
        return {
          history: [],
        };
      },
    });
  }

  back() {
    if (this._vm.history.length > 0) {
      this._vm.history.pop();
    }
  }

  finish() {
    this._vm.history = [];
  }

  push(name, params) {
    this._vm.history.push({
      name,
      params: params || {},
    });
  }

  isEmpty() {
    return this._vm.history.length === 0;
  }

  end() {
    return this.isEmpty()
      ? null
      : this._screens.find((screen) => {
          return (
            screen.name === this._vm.history[this._vm.history.length - 1].name
          );
        });
  }

  navigateTo(name, params = {}) {
    let screen;
    if ((screen = this._screens.find((item) => item.name === name)) === null) {
      /// screen not found
      return;
    }

    if (!this._before.call(null, screen, params)) {
      /// stop propagation
      return;
    }

    this.push(name, params);
  }
}

function overrideInit() {
  const options = this.$options;

  if (options.navigator) {
    this.$navigator = options.navigator;
  } else if (options.parent && options.parent.$navigator) {
    this.$navigator = options.parent.$navigator;
  }
}

export default function install(_Vue, options) {
  if (Vue) {
    console.warn('[Navigation] already installed.');
  }

  Vue = _Vue;

  let version = Number(Vue.version.split('.')[0]);
  if (version >= 2) {
    const usesInit = Vue.config._lifecycleHooks.indexOf('init') !== -1;
    Vue.mixin(
      usesInit ? { init: overrideInit } : { beforeCreate: overrideInit },
    );
  } else {
    const _init = Vue.prototype._init;

    Vue.prototype._init = function (options = {}) {
      options.init =
        typeof options.init === 'function'
          ? [overrideInit, options.init]
          : overrideInit;

      _init.call(this, options);
    };
  }
}
