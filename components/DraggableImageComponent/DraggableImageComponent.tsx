import { NodeViewWrapper } from '@tiptap/react';

export default function DraggableImageComponent({
  node,
  updateAttributes,
}: {
  node: {
    attrs: {
      src: string;
      alt?: string;
      width?: string;
      height?: string;
    };
  };
  updateAttributes: (attrs: Record<string, string>) => void;
}) {
  const { src, alt, width = 'auto', height = 'auto' } = node.attrs;

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
          width: width,
          height: height,
          maxWidth: '100%',
          border: '1px dashed #ddd',
          boxSizing: 'border-box',
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
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
