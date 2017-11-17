var path = require('path')
var webpack = require('webpack')
var fs = require('fs');

// ENTRY and OUTPUT
var entryFolder = './client/';
var outputFolder = path.resolve(__dirname, './public/dist');
var publicFolder = path.resolve(__dirname, './public');
console.log('webpack target in:', entryFolder, 'out:', outputFolder);

// TARGET ALL JS FILES
var targets = fs.readdirSync(entryFolder).filter(x => x.match(/\.js$/));
console.log('found:', targets.join(','));

// APPLY ALL TARGETS
var entry = {};
for (var file of targets) entry[file] = entryFolder + file;
console.log(entry);

// EXPORT SETTING
module.exports = {


    // This is the "main" file which should include all other modules
    entry,
    // Where should the compiled file go?
    output: {
        // To the `dist` folder 
        path: outputFolder,
        publicPath: '/dist/',
        // With the filename `build.js` so it's dist/build.js
        filename: '[name]'
    },
    module: {
        rules: [
            {   // VUE
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {   // JS
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {   // CSS
                test: /\.css$/,
                loader: ["style-loader", "css-loader"]
            },
            {   // STYLUS
                test: /\.styl$/,
                loader: ['style-loader', 'css-loader', 'stylus-loader']
            },
            {   // FILES
                test: /\.(png|jpg|gif|svg|ttf|woff|woff2|eot)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.esm.js',
            'vuetify.css': 'vuetify/dist/vuetify.min.css',
            'material-icons.css': 'material-design-icons/iconfont/material-icons.css',
            'bootstrap.css': 'bootstrap/dist/css/bootstrap.css',
            'bootstrap-vue.css': 'bootstrap-vue/dist/bootstrap-vue.css'
        }
    },
    devServer: {
        //historyApiFallback: true,
        noInfo: true,
        contentBase: publicFolder,
        proxy: {
            '/api': {
                target: 'http://localhost:80/',
                secure: false
            },
            '/round': {
                target: 'http://localhost:80/',
                secure: false
            }
        }
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
