export function ScreenFrame({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      className="fixed inset-0 w-screen h-screen border-0 bg-[#0F0F10]"
    />
  );
}
