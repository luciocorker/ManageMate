// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'folder.fill': 'folder',
  'calendar': 'calendar-today',
  'message.fill': 'message',
  'star.fill': 'star',
  'person.fill': 'person',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'xmark': 'close',
  'magnifyingglass': 'search',
  'line.3.horizontal.decrease': 'filter-list',
  'arrow.up.arrow.down': 'sort',
  'arrow.up.right': 'north-east',
  'arrow.right.square.fill': 'exit-to-app',
  'square.grid.2x2': 'grid-view',
  'list.bullet': 'list',
  'ellipsis': 'more-vert',
  'pencil': 'edit',
  'trash': 'delete',
  'doc.on.doc': 'content-copy',
  'pause.fill': 'pause',
  'play.fill': 'play-arrow',
  'checkmark': 'check',
  'checkmark.circle': 'check-circle',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.seal.fill': 'verified',
  'xmark.seal.fill': 'cancel',
  'archivebox': 'archive',
  'minus': 'remove',
  'clock.fill': 'schedule',
  'location.fill': 'location-on',
  'envelope.fill': 'email',
  'phone.fill': 'phone',
  'bell.fill': 'notifications',
  'lock.fill': 'lock',
  'moon.fill': 'nightlight',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'link.circle.fill': 'link',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
