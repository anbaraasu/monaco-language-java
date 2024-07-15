/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import React from 'react';
import ReactDOM from "react-dom/client";
import ReactMonacoEditor from "./app.js";


// Function to parse query string parameters
function getQueryStringParams(search) {
  return search.substring(1).split("&")
    .reduce((params, param) => {
      const [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {});
}

// Extract multilineString from URL
const params = getQueryStringParams(window.location.search);
const multilineString = params.multilineString || '';

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <div>
    <ReactMonacoEditor filePath="file://C:/Temp/monaco-language-java/packages/examples/react-client/src/HelloWorld.java" multilineString={multilineString} /> 
  </div>
);

