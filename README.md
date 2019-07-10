# Canvas LMS Markdown Editor Plug-in

Plugin for the [Canvas LMS theme app](https://github.com/ahsdile/canvas-lms-app) that adds a Markdown
tab to the rich content editor.

## Installation

Using NPM:

    npm install @auc-ghent/canvas-lms-markdown-editor-plugin

Using Yarn:

    yarn add @auc-ghent/canvas-lms-markdown-editor-plugin

## Usage

Just import the plug-in and add it to the Canvas app:

```javascript
import canvas from '@ahsdile/canvas-lms-app';
import markdownEditorPlugin from '@auc-ghent/canvas-lms-markdown-editor-plugin';

canvas.addPlugin(markdownEditorPlugin);

canvas.run();
```
