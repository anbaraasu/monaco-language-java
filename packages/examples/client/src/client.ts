/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import "monaco-editor/esm/vs/editor/editor.all.js";

// support all editor features
import "monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js";
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js";
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js";
import "monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js";
import "monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import { buildWorkerDefinition } from "monaco-editor-workers";

import {
    MonacoLanguageClient,
    CloseAction,
    ErrorAction,
    MonacoServices,
    MessageTransports,
} from "monaco-languageclient";
import {
    toSocket,
    WebSocketMessageReader,
    WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";
import normalizeUrl from "normalize-url";
import { StandaloneServices } from "vscode/services";
import getMessageServiceOverride from "vscode/service-override/messages";

StandaloneServices.initialize({
    ...getMessageServiceOverride(document.body),
});
buildWorkerDefinition("dist", new URL("", window.location.href).href, false);

// register Monaco languages
monaco.languages.register({
    id: "java",
    extensions: [".java"],
    aliases: ["JAVA", "java"],
    mimetypes: ["application/text"],
});

// create Monaco editor
const value = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": "unix"
}`;
monaco.editor.create(document.getElementById("container")!, {
    model: monaco.editor.createModel(
        value,
        "java",
        monaco.Uri.parse(
            "file://C:/Temp/monaco-language-java/packages/examples/react-client/src/HelloWorld.java"
        )
    ),
    glyphMargin: true,
    lightbulb: {
        enabled: true,
    },
    automaticLayout: true,
});

// install Monaco language client services
MonacoServices.install();

// create the web socket
const url = createUrl("localhost", 4000, "");
const webSocket = new WebSocket(url);

webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
        reader,
        writer,
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
};

function createLanguageClient(
    transports: MessageTransports
): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ["java"],
            // disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart }),
            },
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            },
        },
    });
}

function createUrl(hostname: string, port: number, path: string): string {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
}
