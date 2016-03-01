var webpack = require('webpack');

module.exports = {
    entry: 'src/ractive-colorpicker',
    output: {
        path: __dirname + '/',
        filename: 'ractive-colorpicker.js',
        library: 'RactiveColorpicker',
        libraryTarget: 'umd'
    },
    resolve: {
        root: process.cwd(),
        modulesDirectories: ['node_modules', 'src'],
        extensions: ['', '.js', '.styl', '.html'],
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules)/,
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
