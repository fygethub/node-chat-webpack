var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'eval-source-map',//配置生成Source Maps，选择合适的选项
	entry:{
		home: [/*'webpack/hot/dev-server','webpack-dev-server/client?http://localhost:9090',*/'./src/js/page/home.js'],
		jquery: ['jquery'] //第三方库
	},
	output: {
		path: path.resolve(__dirname,'dist'),
		publicPath:'/dist/',
		filename:'js/[name].js'
	},
	module: {
		loaders: [
			{
				test:/\.js$/,
				loader:'babel',
				query:{
					presets:['es2015'],
					cacheDirectory:true,
					plugins:['transform-runtime'],
				},
				// exclude: '/node_modules/' 使用排除module 会报错 应为会缺少依赖
				include:[path.resolve(__dirname,'./src')]
			},
			{
				test:/\.css$/,
				loader: ExtractTextPlugin.extract('style','css')
			},
			 { 
			 	test: /\.(png|jpg|jpeg|gif|woff)$/,
			 	loader: 'url-loader?limit=1&name=imgs/emoji/[name].[ext]'
			 },
			 {
				//html模板加载器，可以处理引用的静态资源，默认配置参数attrs=img:src，处理图片的src引用的资源
				//比如你配置，attrs=img:src img:data-src就可以一并处理data-src引用的资源了，就像下面这样
				test: /\.html$/,
				loader: "html?attrs=img:src img:data-src"
			},
			{
				test:/\.less$/,
				loader: ExtractTextPlugin.extract('css!less')
			}
		]
	},resolve: {
		extensions: ['','.js','.css','.scss','.less'],
		/*alias: {
            jquery: "jquery/src/jquery"
        }*/
	},
   /* externals:{
        '$':'Jquery',
    },*/
	plugins: [
		new webpack.ProvidePlugin({
			$ : 'jquery',
		}),
		new ExtractTextPlugin('css/[name].css'),
		new webpack.optimize.CommonsChunkPlugin({
			name:'jquery',
			chunks:['home','jquery'],
			minChunks:2
		}),  //抽取公共样式文件,命名为name
		new HtmlWebpackPlugin({
			favicon:'./src/imgs/favicon.ico',
			//输出的路径
			filename:'./view/home.html',
			template: './src/view/home.html',
			inject:'body',
			hash:false,
			cache:false,
			chunks:['home','jquery'],
			minify:{
				removeComments:false,
				collapseWhitespace:false
			}
		}),
		new webpack.HotModuleReplacementPlugin() //热加载
	],
	//使用webpack-dev-server，提高开发效率
	devServer: {
		contentBase: './dist',
		host: 'localhost',
		port: 8080,
		inline: true,
		hot: true,
		stats: {colors:true},
        proxy:{
            '**':{
                target:'http://localhost:3000',
            }
        }
	}
}
