import React from 'react';
import { Card } from '@material-ui/core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import codeStyles from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';

import './JSONOutput.css';

export default function JSONOutput(props) {
  return (
    <Card className="json-output-wrapper">
      <SyntaxHighlighter language="json" style={codeStyles} showLineNumbers>
        {JSON.stringify(props.output, null, '\t')}
      </SyntaxHighlighter>
    </Card>
  );
}