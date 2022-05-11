const BundleTracker = require("webpack-bundle-tracker");

const pages = {
    "index": {
        entry: "./src/index.js",
        chunks: ["chunk-vendors"]
    },
    "detail": {
        entry: "./src/detail.js",
        chunks: ["chunk-vendors"]
    },
    "edit": {
        entry: "./src/edit.js",
        chunks: ["chunk-vendors"]
    },
    "entities": {
        entry: "./src/entities.js",
        chunks: ["chunk-vendors"]
    },
    "scenarios": {
        entry: "./src/scenarios.js",
        chunks: ["chunk-vendors"]
    },
    "solves": {
        entry: "./src/solves.js",
        chunks: ["chunk-vendors"]
    },
    "run": {
        entry: "./src/run.js",
        chunks: ["chunk-vendors"]
    },
    "results": {
        entry: "./src/results.js",
        chunks: ["chunk-vendors"]
    },
    "upgrade-notification": {
        entry: "./src/upgradeNotification.js",
        chunks: ["chunk-vendors"]
    }
}

module.exports = {
    pages: pages,
    filenameHashing: false,
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === 'production'
        ? ''
        : 'http://localhost:8080/',
    outputDir: '../static/flextool3/apps',
    chainWebpack: config => {

        config.optimization
            .splitChunks({
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "chunk-vendors",
                        chunks: "all",
                        priority: 1
                    },
                },
            });

        Object.keys(pages).forEach(page => {
            config.plugins.delete(`html-${page}`);
            config.plugins.delete(`preload-${page}`);
            config.plugins.delete(`prefetch-${page}`);
        })

        config
            .plugin('BundleTracker')
            .use(BundleTracker, [{filename: 'webpack-stats.json'}]);

        config.resolve.alias
            .set('__STATIC__', 'static')

        config.devServer
            .public('http://localhost:8080')
            .host('localhost')
            .port(8080)
            .hotOnly(true)
            .watchOptions({poll: 1000})
            .https(false)
            .headers({"Access-Control-Allow-Origin": ["*"]})
    }
};
