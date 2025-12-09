import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/**
 * Pixel Icon Component
 *
 * Renders pixel-art style icons using the pixelarticons font library.
 * Provides a mapping from Material Icon names to pixelarticons equivalents.
 *
 * Usage:
 * <app-pixel-icon name="play" />
 * <app-pixel-icon name="close" size="lg" />
 */
@Component({
  selector: 'app-pixel-icon',
  template: `<i [class]="iconClass()" aria-hidden="true"></i>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    i {
      display: inline-block;
      font-style: normal;
      line-height: 1;
    }

    .icon-sm { font-size: 16px; }
    .icon-md { font-size: 24px; }
    .icon-lg { font-size: 32px; }
    .icon-xl { font-size: 48px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelIconComponent {
  /** Icon name (accepts Material icon names, will be mapped to pixelarticons) */
  name = input.required<string>();

  /** Icon size: sm, md, lg, xl */
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Mapping from Material Icons to pixelarticons font classes */
  private readonly iconMap: Record<string, string> = {
    // Player controls
    play_arrow: 'play',
    pause: 'pause',
    stop: 'player-stop',
    skip_next: 'player-next',
    skip_previous: 'player-previous',
    replay: 'redo',
    refresh: 'reload',
    autorenew: 'reload',

    // Navigation
    arrow_back: 'arrow-left',
    arrow_forward: 'arrow-right',
    arrow_upward: 'arrow-up',
    arrow_downward: 'arrow-down',
    chevron_left: 'chevron-left',
    chevron_right: 'chevron-right',
    keyboard_arrow_up: 'chevron-up',
    keyboard_arrow_down: 'chevron-down',
    keyboard_arrow_left: 'chevron-left',
    keyboard_arrow_right: 'chevron-right',
    expand_more: 'chevron-down',
    expand_less: 'chevron-up',

    // Actions
    close: 'close',
    check: 'check',
    check_circle: 'checkbox-on',
    add: 'plus',
    remove: 'minus',
    delete: 'trash',
    edit: 'edit',
    save: 'save',
    search: 'search',
    settings: 'sliders',
    menu: 'menu',
    more_vert: 'more-vertical',
    more_horiz: 'more-horizontal',

    // Status/Feedback
    error: 'warning-box',
    warning: 'alert',
    info: 'info-box',
    help: 'info-box',
    help_outline: 'info-box',
    info_outline: 'info-box',

    // Objects
    home: 'home',
    star: 'bookmark',
    stars: 'bookmark',
    favorite: 'heart',
    visibility: 'visible',
    visibility_off: 'invisible',
    lock: 'lock',
    lock_open: 'lock-open',
    person: 'user',
    people: 'users',
    group: 'group',
    account_circle: 'user',
    account_balance_wallet: 'wallet',
    smart_toy: 'gamepad',
    touch_app: 'human',

    // Files/Content
    folder: 'folder',
    file_copy: 'copy',
    content_copy: 'copy',
    collections: 'image-gallery',
    image: 'image',
    photo_library: 'image-gallery',
    description: 'file',
    note: 'note',
    article: 'article',

    // Communication
    send: 'forward',
    chat: 'message',
    mail: 'mail',
    notifications: 'notification',

    // Apps/Features
    apps: 'view-list',
    dashboard: 'layout',
    leaderboard: 'sort-numeric',
    poll: 'chart-bar',
    casino: 'dice',
    sports_esports: 'gamepad',
    videogame_asset: 'gamepad',
    calculate: 'calculator',
    timer: 'clock',
    schedule: 'clock',
    calendar_today: 'calendar',
    flag: 'flag',

    // Shopping/E-commerce
    shopping_cart: 'cart',
    add_shopping_cart: 'cart',

    // Grid/Layout
    grid_view: 'grid',
    grid_3x3: 'grid',
    view_module: 'grid',

    // Games specific
    pest_control: 'bug',
    how_to_vote: 'checkbox-on',
    filter_2: 'sort-numeric',
    sports_tennis: 'gamepad',
    flutter_dash: 'android',
    star_rate: 'bookmark',

    // Photo/Image
    photo: 'image',
    photo_camera: 'camera',

    // External
    open_in_new: 'external-link',
    launch: 'external-link',
    link: 'link',
    share: 'forward',

    // Misc
    celebration: 'mood-happy',
    emoji_events: 'trophy',
    sentiment_very_dissatisfied: 'mood-sad',
    sentiment_satisfied: 'mood-happy',
    swap_vert: 'switch',
    swap_horiz: 'switch',
    sync: 'reload',
    logout: 'logout',
    login: 'login',
    fullscreen: 'scale',
    fullscreen_exit: 'scale',
    volume_up: 'volume',
    volume_off: 'volume-x',
    music_note: 'music',
    radio: 'radio-signal',
    currency_exchange: 'coin',
    attach_money: 'coin',
    trending_up: 'trending-up',
    trending_down: 'trending-down',
    receipt: 'article',
    undo: 'undo',
    palette: 'colors-swatch',
  };

  /** Computed CSS class for the icon */
  iconClass = computed(() => {
    const name = this.name();
    const size = this.size();

    // Get mapped icon name or fallback to the name itself
    const iconName = this.iconMap[name] || name;
    const sizeClass = `icon-${size}`;

    return `pixelart-icons-font-${iconName} ${sizeClass}`;
  });
}
