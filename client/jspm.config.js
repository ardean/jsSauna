SystemJS.config({
  browserConfig: {
    "paths": {
      "npm:": "/jspm_packages/npm/",
      "github:": "/jspm_packages/github/",
      "jssauna/": "/src/"
    }
  },
  nodeConfig: {
    "paths": {
      "npm:": "jspm_packages/npm/",
      "github:": "jspm_packages/github/",
      "jssauna/": "src/"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.20",
      "babel-runtime": "npm:babel-runtime@5.8.38",
      "core-js": "npm:core-js@1.2.7",
      "fs": "npm:jspm-nodelibs-fs@0.2.0",
      "path": "npm:jspm-nodelibs-path@0.2.1"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "jssauna": {
      "main": "index.js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "jquery": "npm:jquery@3.1.1",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1"
  },
  packages: {}
});
