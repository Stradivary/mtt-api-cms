import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react';

export default function DraggableImageComponent({
  node,
  updateAttributes,
}: ReactNodeViewProps) {
  const { src, alt, width = 'auto', height = 'auto' } = node.attrs as {
    src: string;
    alt?: string;
    width?: string;
    height?: string;
  };

  return (
    <NodeViewWrapper
      className="draggable-image-node"
      style={{ margin: '1rem 0' }}
    >
      <div
        contentEditable={false}
        style={{
          resize: 'both',
          overflow: 'auto',
          display: 'block',
          width,
          height,
          maxWidth: '100%',
          minWidth: '100px',
          minHeight: '100px',
          border: '1px dashed #ddd',
          boxSizing: 'border-box',
          background: '#fff',
        }}
        onMouseUp={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          updateAttributes({
            width: `${target.offsetWidth}px`,
            height: `${target.offsetHeight}px`,
          });
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
