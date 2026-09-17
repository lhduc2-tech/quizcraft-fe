import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    // Default is light unless user explicitly saved dark
    const saved = localStorage.getItem('qc_craft_theme');
    const isDark = saved === 'dark';
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode());
  }

  private applyTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qc_craft_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qc_craft_theme', 'light');
    }
  }
}
