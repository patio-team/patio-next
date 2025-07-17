import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  LexicalEditor,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
  HeadingNode,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import { useCallback, useEffect, useState } from 'react';
import { INSERT_IMAGE_COMMAND } from './image-plugin';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Type,
  ImageIcon,
} from 'lucide-react';

const LowPriority = 1;

function ToolbarButton({
  onClick,
  disabled = false,
  active = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-blue-400 bg-blue-100' : 'bg-white'} `}>
      {children}
    </button>
  );
}

function BlockTypeDropdown({
  blockType,
  editor,
}: {
  blockType: string;
  editor: LexicalEditor;
}) {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        onClick={formatParagraph}
        active={blockType === 'paragraph'}>
        <Type size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatHeading('h1')}
        active={blockType === 'h1'}>
        <Heading1 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatHeading('h2')}
        active={blockType === 'h2'}>
        <Heading2 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatHeading('h3')}
        active={blockType === 'h3'}>
        <Heading3 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={formatQuote}
        active={blockType === 'quote'}>
        <Quote size={16} />
      </ToolbarButton>
    </div>
  );
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if (element.getType() === 'heading') {
          const tag = (element as HeadingNode).getTag();
          setBlockType(tag);
        } else if (element.getType() === 'quote') {
          setBlockType('quote');
        } else if ($isListNode(element)) {
          const parentList = (element as ListNode).getListType();
          setBlockType(parentList);
        } else {
          setBlockType('paragraph');
        }
      }

      // Update link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if (parent && parent.getType() === 'link') {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      LowPriority,
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter the image URL:');
    if (url) {
      const altText = prompt('Enter alt text for the image:') || '';
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: url,
        altText,
      });
    }
  }, [editor]);

  return (
    <div className="toolbar flex items-center gap-2 border-b border-gray-200 bg-gray-50 p-2">
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          active={isBold}>
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
          active={isItalic}>
          <Italic size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
          active={isUnderline}>
          <Underline size={16} />
        </ToolbarButton>
      </div>

      <div className="h-6 w-px bg-gray-300" />

      {/* Block Types */}
      <BlockTypeDropdown
        blockType={blockType}
        editor={editor}
      />

      <div className="h-6 w-px bg-gray-300" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => {
            if (blockType !== 'bullet') {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            }
          }}
          active={blockType === 'bullet'}>
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            if (blockType !== 'number') {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            }
          }}
          active={blockType === 'number'}>
          <ListOrdered size={16} />
        </ToolbarButton>
      </div>

      <div className="h-6 w-px bg-gray-300" />

      {/* Link */}
      <ToolbarButton
        onClick={insertLink}
        active={isLink}>
        <Link size={16} />
      </ToolbarButton>

      <div className="h-6 w-px bg-gray-300" />

      {/* Image */}
      <ToolbarButton onClick={insertImage}>
        <ImageIcon size={16} />
      </ToolbarButton>
    </div>
  );
}
