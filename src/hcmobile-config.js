const vscode = require('vscode');
// const cm = require('./hcmobile-config-gl');
const http = require('https');
const fs = require('fs');
const path = require('path');
const util = require('./util');
// const axios = require('./axios.min')
const querystring = require('querystring');
const axios = require('./lib/lib/axios');



module.exports = function (context) {
    // 注册HelloWord命令
    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runhtml', (uri) => {
        let ipconf = vscode.workspace.getConfiguration().get("editIp_key");
        if (ipconf) {
            doPostMet(context, uri.fsPath, 'html');
        } else {
            vscode.window.showInformationMessage('需要配置cloud grid地址');
            createWebview(context, function () {
                doPostMet(context, uri.fsPath, 'html');
            })
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runjs', (uri) => {
        let ipconf = vscode.workspace.getConfiguration().get("editIp_key");
        if (ipconf) {
            doPostMet(context, uri.fsPath, 'js');
        } else {
            vscode.window.showInformationMessage('需要配置cloud grid地址');
            createWebview(context, function () {
                doPostMet(context, uri.fsPath, 'js');
            })
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.hcmobile.runapp', (uri) => {
        let ipconf = vscode.workspace.getConfiguration().get("editIp_key");
        if (ipconf) {
            doPostMet(context, uri.fsPath, 'url');
        } else {
            vscode.window.showInformationMessage('需要配置cloud grid地址');
            createWebview(context, function () {
                doPostMet(context, uri.fsPath, 'url');
            })
        }
    }));
};



function createWebview(context, callBack) {
    const panel = vscode.window.createWebviewPanel(
        'testWebview', // viewType
        "配置调试ip", // 视图标题
        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
        {
            enableScripts: true, // 启用JS，默认禁用
            retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
        }
    );

    panel.webview.html = getWebViewContent(context, 'src/view/test-webview.html');
    panel.webview.onDidReceiveMessage(message => {
        console.log(JSON.stringify(message));
        try {
            switch (message.cmd) {
                case "getIp":
                    let ipM = vscode.workspace.getConfiguration().get("editIp_key");
                    let ipP = vscode.workspace.getConfiguration().get("editPc_key");
                    // {ipMobile:ipM , ipPc:ipP}
                    panel.webview.postMessage({cmd: 'getIp', data: {cmd: 'getIp', ipMobile: ipM, ipPc: ipP}});
                break
                case "editIp":
                    message.ip;
                    vscode.workspace.getConfiguration().update("editIp_key", message.ipMobile);
                    vscode.workspace.getConfiguration().update("editPc_key", message.ipPc);
                    let ipconf = vscode.workspace.getConfiguration().get("editIp_key");
                    vscode.window.showInformationMessage(ipconf);
                    if (callBack) {
                        callBack();
                        panel.dispose();
                    }
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }, undefined, context.subscriptions);
}


function doPostMet(context, path, key) {
    let ipconf = vscode.workspace.getConfiguration().get("editIp_key");
    // console.log(ipconf);
    if (!ipconf.startsWith("http://")) {
        ipconf = "http://" + ipconf;
    }

    try {
        let text = fs.readFileSync(path, 'utf-8');
        let data = {
            key: text
        }

        axios.post(ipconf + "/run_vs_js", data)
            .then(response => {
                // console.log(response.data.url);
                // console.log(response.data.explanation);
                vscode.window.showInformationMessage('运行成功');
            })
            .catch(error => {
                // console.log(error);
                vscode.window.showInformationMessage('ip:'+ipconf+'不可用，请检查网络');
                createWebview(context);
            });
    } catch (e) {
        console.log(e);
    }

}



function getWebViewContent(context, templatePath) {
    const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}


