const vscode = require('vscode');
const cm = require('./hcmobile-config-gl');
const http = require('http');
const fs = require('fs');
const path = require('path');
const util = require('./util');

module.exports = function (context) {
    // 注册HelloWord命令
    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runhtml', (uri) => {

        if (cm.ipconfig) {
            try {
                let text = fs.readFileSync(uri.fsPath, 'utf-8');
                //  console.log(text);

                const options = {
                    hostname: 'http://baidu.com',
                    port: 80,
                    path: '/runJsCode',
                    method: 'POST',
                    body: text
                };
                // const req = http.request(options, (res) => {
                //     console.log(`状态码: ${res.statusCode}`);
                //     console.log(`响应头: ${JSON.stringify(res.headers)}`);
                //     res.setEncoding('utf8');
                //     res.on('data', (chunk) => {
                //         console.log(`响应主体: ${chunk}`);
                //     });
                //     res.on('end', () => {
                //         console.log('响应中已无数据。');
                //     });
                // });

                // req.on('error', (e) => {
                //     console.error(`请求遇到问题: ` + e);
                // });


            } catch (e) {
                console.log(e);
            }
        } else {

            // 工程目录一定要提前获取，因为创建了webview之后activeTextEditor会不准确

            const panel = vscode.window.createWebviewPanel(
                'testWebview', // viewType
                "WebView演示", // 视图标题
                vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                {
                    enableScripts: true, // 启用JS，默认禁用
                    retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                }
            );

            panel.webview.html = getWebViewContent(context, 'src/view/test-webview.html');
            panel.webview.onDidReceiveMessage(message => {
                console.log(JSON.stringify(message) + "---powyin")

                try {
                    switch (message.cmd) {
                        case "editIp":
                            message.ip;
                            vscode.window.showInformationMessage(message.ip);
                            break;
                    }
                } catch (e) {
                    console.log(e);
                }
            }, undefined, context.subscriptions);

            cm.ipconfig = "true";


        }

    }));


    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runjs', (uri) => {
        // vscode.window.showInformationMessage('Hello World！你好，小茗同学！hcmobile' + uri.fsPath);

        if (cm.ipconfig) {
            try {
                let text = fs.readFileSync(uri.fsPath, 'utf-8');
                //  console.log(text);

                const options = {
                    hostname: 'http://baidu.com',
                    port: 80,
                    path: '/runJsCode',
                    method: 'POST',
                    body: text
                };
                // const req = http.request(options, (res) => {
                //     console.log(`状态码: ${res.statusCode}`);
                //     console.log(`响应头: ${JSON.stringify(res.headers)}`);
                //     res.setEncoding('utf8');
                //     res.on('data', (chunk) => {
                //         console.log(`响应主体: ${chunk}`);
                //     });
                //     res.on('end', () => {
                //         console.log('响应中已无数据。');
                //     });
                // });

                // req.on('error', (e) => {
                //     console.error(`请求遇到问题: ` + e);
                // });


            } catch (e) {
                console.log(e);
            }
        } else {

            // 工程目录一定要提前获取，因为创建了webview之后activeTextEditor会不准确

            const panel = vscode.window.createWebviewPanel(
                'testWebview', // viewType
                "WebView演示", // 视图标题
                vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                {
                    enableScripts: true, // 启用JS，默认禁用
                    retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                }
            );

            panel.webview.html = getWebViewContent(context, 'src/view/test-webview.html');
            panel.webview.onDidReceiveMessage(message => {
                console.log(JSON.stringify(message) + "---powyin")

                try {
                    switch (message.cmd) {
                        case "editIp":
                            message.ip;
                            vscode.window.showInformationMessage(message.ip);
                            break;
                    }
                } catch (e) {
                    console.log(e);
                }
            }, undefined, context.subscriptions);

            cm.ipconfig = "true";


        }

    }));



};







/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
    const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}


