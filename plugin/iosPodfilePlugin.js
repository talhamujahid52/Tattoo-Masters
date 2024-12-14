const { withPodfile } = require('@expo/config-plugins');

// Function to modify the Podfile
function modifyPodfile(podfileContents) {
  const lines = podfileContents.split('\n');

  // Update deployment target to 15
  const deploymentTargetLineIndex = lines.findIndex((line) => line.startsWith('platform :ios'));
  if (deploymentTargetLineIndex !== -1) {
    lines[deploymentTargetLineIndex] = "platform :ios, podfile_properties['ios.deploymentTarget'] || '14'";
  }

  const marker = "config = use_native_modules!";
  const newLines = [
    "  rn_maps_path = '../node_modules/react-native-maps'",
    "  pod 'react-native-google-maps', :path => rn_maps_path",
  ];

  const markerIndex = lines.findIndex((line) => line.includes(marker));

  if (markerIndex === -1) {
    throw new Error("Could not find the marker 'config = use_native_modules!' in the Podfile.");
  }

  // Add new lines before the marker
  lines.splice(markerIndex, 0, ...newLines);

  return lines.join('\n');
}

// Plugin to modify the Podfile
const withReactNativeMapsPod = (config) => {
  return withPodfile(config, (config) => {
    config.modResults.contents = modifyPodfile(config.modResults.contents);
    return config;
  });
};

module.exports = withReactNativeMapsPod;
