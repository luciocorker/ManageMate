import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

const App = () => <ExpoRoot />;

registerRootComponent(App);