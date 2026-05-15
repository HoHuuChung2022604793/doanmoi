import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'productImage',
  standalone: true
})
export class ProductImagePipe implements PipeTransform {
  private readonly placeholder = 'https://via.placeholder.com/300x300?text=Phone';

  transform(path: string | undefined | null): string {
    if (!path) return this.placeholder;
    if (path.startsWith('http')) return path;

    // Normalize path (handle Windows backslash)
    const normalizedPath = path.replace(/\\/g, '/');
    const baseUrl = environment.apiUrl.replace('/api', '');

    const finalUrl = normalizedPath.startsWith('/')
      ? `${baseUrl}${normalizedPath}`
      : `${baseUrl}/${normalizedPath}`;

    return finalUrl;
  }
}
