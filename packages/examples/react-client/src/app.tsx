import React, { useEffect, useState } from "react"
import * as monaco from "monaco-editor"
import Editor, { loader } from "@monaco-editor/react"
import "monaco-editor/esm/vs/editor/editor.all.js"
import "./App.css";
import "monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js"
import "monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js"
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js"
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js"
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js"
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js"
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js"
import "monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js"
import "monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js"
import "monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js"
//import "@monaco-editor/esm/vs/editor/standalone/browser/codeAction/codeActionContributions.js"

import {
  CloseAction,
  ErrorAction,
  MonacoLanguageClient,
  MonacoServices,
  ProposedFeatures,
} from "monaco-languageclient"
import normalizeUrl from "normalize-url"
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} from "vscode-ws-jsonrpc"

loader.config({ monaco })

export function createUrl(
  hostname: string,
  port: string,
  path: string
): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws"
  return normalizeUrl(`${protocol}://${hostname}:${port}${path}`)
}

function createLanguageClient(transports: any) {
  return new MonacoLanguageClient({
    name: "Java Language Client",
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
        return Promise.resolve(transports)
      },
    },
  })
}

function createWebSocket(url: string) {
  const webSocket = new WebSocket(url)
  webSocket.onopen = () => {
    const socket = toSocket(webSocket)
    const reader = new WebSocketMessageReader(socket)
    const writer = new WebSocketMessageWriter(socket)
    const languageClient = createLanguageClient({
      reader,
      writer,
    })
    languageClient.start()
    reader.onClose(() => languageClient.stop())
  }
}



const MonacoEditor = ({ filePath, multilineString}) => {
  // filepath should be server system file path
  // <ReactMonacoEditor filePath="file://C:/Temp/monaco-language-java/packages/examples/react-client/src/HelloWorld.java" /> 
  //<ReactMonacoEditor filePath="{selectedFile}" />

  const hostname = "localhost"
  const urlPath = ""
  const port = "4000"
  const codestr = `public class HelloWorld {
    public static void main(String[] args) {
      System.out.println("Hello, World!");
    }
}`
  const [codeError, setCodeError] = useState(false)
  const [code, setCode] = useState(codestr)
  const [isLoading, setIsLoading] = useState(false); // Add this line
  const onMount = (editor, monacoInstance) => {
    monacoInstance.languages.register({
      id: "java",
      extensions: [".java"],
      aliases: ["JAVA", "java"],
      mimetypes: ["application/text"],
    })
    MonacoServices.install()
  }

  useEffect(() => {
    const url = createUrl(hostname, port, urlPath)
    createWebSocket(url)
  }, [])
  const editorCustomOptions = {
    acceptSuggestionOnEnter: 'smart',
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
  }

  const [evaluationResult, setEvaluationResult] = useState('Click "Evaluate" button to execute the Code...');

  const evaluateCode = async () => {
    setCodeError(false);
    setEvaluationResult('Evaluation in progress..........');
    setIsLoading(true); // Stop loading after evaluation is done
    try {
      const response = await fetch('http://localhost:3001/execute-java?className=HelloWorld', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        setIsLoading(false); // Stop loading after evaluation is done
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Assuming the server response contains fields `error` and `output`
      if (result.error) {
        setIsLoading(false); // Stop loading after evaluation is done
        setCodeError(true)
        setEvaluationResult(`${result.error}`);
      } else {
        setIsLoading(false); // Stop loading after evaluation is done
        setCodeError(false);
        setEvaluationResult(`${result.output}`);
      }
    } catch (error) {
      setIsLoading(false); // Stop loading after evaluation is done
      setCodeError(true)
      console.error("Failed to evaluate code:", error);
      setEvaluationResult(`Failed to evaluate code: ${error}`);
    }
  };

  

  return (
    <><div >{isLoading ? <img src="loading.gif" alt="Loading..." style={{ backgroundColor: 'transparent' }} width="60px" height="40px" /> : <button style={{ position: 'relative' }} className="btn btn-info" onClick={evaluateCode}>
      Execute
    </button>}
      
          <Editor
            path={filePath}
            height="75vh"
            value={code}

            onChange={(newCode) => {
              if (newCode) {
                setCode(newCode);
              }
            }}
            options={editorCustomOptions}
            loading={"Loading..."}
            keepCurrentModel={true}
            theme={"vs-dark"}
            onMount={onMount}
          />
      <div style={{ backgroundColor: 'black', color: codeError ? '#FF6347' : 'white', height: '90px', whiteSpace: 'pre-wrap', overflow: 'auto' }}>{evaluationResult}</div></div></>
  )
}

export default MonacoEditor
