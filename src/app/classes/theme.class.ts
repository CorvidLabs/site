export class Theme {
  name: string;
  isDark: boolean;

  primaryBg: string;
  secondaryBg: string;
  sectionBg: string;
  primaryText: string;
  secondaryText: string;
  primaryAccent: string;
  secondaryAccent: string;
  borderColor: string;

  playerBg: string;

  constructor() {
    this.name = '';
    this.isDark = false;
    
    this.primaryBg = '';
    this.secondaryBg = '';
    this.sectionBg = '';
    this.primaryText = '';
    this.secondaryText = '';
    this.primaryAccent = '';
    this.secondaryAccent = '';
    this.borderColor = '';
    this.playerBg = '';

  }
}