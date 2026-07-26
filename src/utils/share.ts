import { Wheel } from '../types';

export function encodeWheelToUrl(wheel: Wheel): string {
  try {
    const minified = {
      t: wheel.title,
      d: wheel.description || '',
      tm: wheel.themeId,
      o: wheel.options.map((opt) => ({
        l: opt.label,
        w: opt.weight,
        c: opt.color,
      })),
    };
    const jsonStr = JSON.stringify(minified);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#wheel=${encoded}`;
  } catch (err) {
    console.error('Failed to encode wheel for sharing:', err);
    return window.location.href;
  }
}

export function decodeWheelFromUrl(): Wheel | null {
  try {
    const hash = window.location.hash;
    if (!hash.includes('wheel=')) return null;

    const encoded = hash.split('wheel=')[1];
    if (!encoded) return null;

    const jsonStr = decodeURIComponent(atob(encoded));
    const data = JSON.parse(jsonStr);

    if (!data || !data.t || !Array.isArray(data.o)) return null;

    const sharedWheel: Wheel = {
      id: 'shared-' + Date.now(),
      title: data.t,
      description: data.d || 'Shared via SpinSphere link',
      themeId: data.tm || 'cyberpunk',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      options: data.o.map((opt: any, i: number) => ({
        id: `shared-opt-${i}-${Date.now()}`,
        label: opt.l || `Option ${i + 1}`,
        weight: typeof opt.w === 'number' ? opt.w : 1,
        color: opt.c || '#06b6d4',
      })),
    };

    return sharedWheel;
  } catch (err) {
    console.error('Failed to decode shared wheel:', err);
    return null;
  }
}

export function exportWheelAsImage(canvas: HTMLCanvasElement, title: string) {
  try {
    // Create offscreen canvas with extra header & footer for export
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const padding = 60;
    const headerHeight = 90;
    const footerHeight = 60;

    exportCanvas.width = canvas.width + padding * 2;
    exportCanvas.height = canvas.height + headerHeight + footerHeight + padding;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, exportCanvas.height);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#030712');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Title header
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, exportCanvas.width / 2, 50);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px sans-serif';
    ctx.fillText('SPINSPHERE • INTERACTIVE DECISION MAKER', exportCanvas.width / 2, 75);

    // Draw the main wheel canvas
    ctx.drawImage(canvas, padding, headerHeight);

    // Footer branding
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, exportCanvas.width / 2, exportCanvas.height - 25);

    // Download trigger
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-spinsphere.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Failed to export wheel image:', err);
  }
}
