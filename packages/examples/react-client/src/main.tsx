/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import React from "react";
import ReactDOM from "react-dom/client";
import ReactMonacoEditor from "./app.js";

const root = ReactDOM.createRoot(document.getElementById("root")!);
// filepath should be server system file path
root.render(
  <div>
    <ReactMonacoEditor filePath="file://C:/Temp/monaco-language-java/packages/examples/react-client/src/HelloWorld.java" />
    
  </div>
);

