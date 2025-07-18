import ToolbarPlugin from './toolbar-plugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import PatioEditorTheme from './editor-theme';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ImageNode } from './image-node';
import ImagePlugin from './image-plugin';

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

function MyErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Plugin to set initial HTML content
function InitialValuePlugin({ initialValue }: { initialValue?: string }) {
  const [editor] = useLexicalComposerContext();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (initialValue && !hasInitialized) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialValue, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
      setHasInitialized(true);
    }
  }, [editor, initialValue, hasInitialized]);

  return null;
}

const editorConfig = {
  namespace: 'PatioEditor',
  theme: PatioEditorTheme,
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
  ],
};

export default function Editor({
  onChange,
  initialValue,
}: {
  onChange: (editorState: string) => void;
  initialValue?: string;
}) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={MyErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagePlugin />
          <InitialValuePlugin initialValue={initialValue} />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor);
                onChange(html);
              });
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
