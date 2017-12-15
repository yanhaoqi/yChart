/**
 * Created by yanhaoqi on 2017/12/15.
 */
let http = require('http')
let fs = require('fs')
let path = require('path')
//根据文件扩展名得出文件的mime
let mime = require('mime')

//用来缓存文件内容的对象 把文件内容缓存在内存中 比直接去文件系统中读取快很多
let cache = {}

function send404(response) {
    response.writeHead(404, {"Content-Type":"text/html;charset=utf-8"})
    response.write("<h1>Sorry, 您访问的资源不存在...</h1>")
    response.end()
}
function sendFile(response, filePath, fileContents) {
    response.writeHead(200,{"Content-Type": mime.lookup(path.basename(filePath))})
    response.write(fileContents)
    response.end()
}
function serveStatic(response, cache, absPath) {
    //判断文件是否被缓存在内存(对象cache)中
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath])
    } else {
        fs.access(absPath, fs.constants.F_OK, (err) => {
            if (err) {
                //文件不存在 返回404
                send404(response)
            } else {
                fs.readFile(absPath, (err, data) => {
                    //文件存在但是读取出错 返回404
                    if (err) {
                        send404(response)
                    } else {
                        //把读取的文件存入内存
                        cache[absPath] = data
                        //文件存在且正确读取 正常返回
                        sendFile(response, absPath, cache[absPath])
                    }
                })
            }
        })
    }
}
let server = http.createServer((request, response) => {
    let filePath = ''
    if (request.url == '/') {
        filePath = 'client/index.html'
    } else {
        filePath = 'client' + request.url
    }
    var absPath = './' + filePath
    //调用返回静态资源的函数
    serveStatic(response, cache, absPath)
}).listen(6000, () => {
    console.log('yChart服务已启动')
})