var webpack = require('webpack');

module.exports = {
    entry: 'src/ractive-colorpicker',
    production: true,
    output: {
        path: __dirname + '/',
        filename: 'ractive-colorpicker.min.js',
        library: 'RactiveColorpicker',
        libraryTarget: 'umd'
    },
    resolve: {
        root: process.cwd(),
        modulesDirectories: ['node_modules', 'src'],
        extensions: ['', '.js', '.styl', '.html'],
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules|lib|parsers|syntax)/,
                query: {
                    cacheDirectory: true,
                    presets: ['es2015']
                }
            },
            {test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader'},
            {test: /\.html/, loader: 'ractive-loader'}
        ],
    },
    stylus: {
        use: [require('nib')()],
        import: ['~nib/lib/nib/index.styl']
    }
}
