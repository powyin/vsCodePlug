const vscode = require('vscode');
const cm = require('./hcmobile-config-gl');

const fs = require('fs');
const path = require('path');
const util = require('./util');

module.exports = function (context) {
    // 注册HelloWord命令
    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runjs', (uri) => {
        vscode.window.showInformationMessage('Hello World！你好，小茗同学！hcmobile');
        vscode.window.showInformationMessage(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
        if (cm.ipconfig) {


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
            }, undefined, context.subscriptions);


        }

    }));


    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runjshtml', (uri) => {
      
        vscode.window.showInformationMessage('Hello World！你好，小茗同学！hcmobile');
        vscode.window.showInformationMessage(`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
        if (cm.ipconfig) {


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
            }, undefined, context.subscriptions);


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

/**
 * 执行回调函数
 * @param {*} panel 
 * @param {*} message 
 * @param {*} resp 
 */
function invokeCallback(panel, message, resp) {
    console.log('回调消息：', resp);
    // 错误码在400-600之间的，默认弹出错误提示
    if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
        util.showError(resp.message || '发生未知错误！');
    }
    panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = {
    // 弹出提示
    alert(global, message) {
        util.showInfo(message.info);
    },
    // 显示错误提示
    error(global, message) {
        util.showError(message.info);
    },
    // 获取工程名
    getProjectName(global, message) {
        invokeCallback(global.panel, message, util.getProjectName(global.projectPath));
    },
    openFileInFinder(global, message) {
        util.openFileInFinder(`${global.projectPath}/${message.path}`);
        // 这里的回调其实是假的，并没有真正判断是否成功
        invokeCallback(global.panel, message, { code: 0, text: '成功' });
    },
    openFileInVscode(global, message) {
        util.openFileInVscode(`${global.projectPath}/${message.path}`, message.text);
        invokeCallback(global.panel, message, { code: 0, text: '成功' });
    },
    openUrlInBrowser(global, message) {
        util.openUrlInBrowser(message.url);
        invokeCallback(global.panel, message, { code: 0, text: '成功' });
    }
};

