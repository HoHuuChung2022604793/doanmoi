import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, Renderer } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  async transform(value: string | undefined): Promise<SafeHtml> {
    if (!value) return '';
    
    // Custom renderer cho links
    const renderer = new Renderer();
    renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
      // Link nội bộ (sản phẩm)
      if (href && href.startsWith('/products/')) {
        return `<a href="${href}" class="product-link-inline" title="${title || text}">${text}</a>`;
      }
      // Link ngoài
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
    };

    const html = await marked.parse(value, {
      breaks: true,
      gfm: true,
      renderer: renderer
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
