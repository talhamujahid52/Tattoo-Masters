const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * A function to add a meta-data tag with the Google Maps API key in the AndroidManifest.xml file.
 *
 * @param config - Expo config object
 * @param apiKey - Your Google Maps API key
 * @returns Updated Expo config object
 */
function withGoogleMapsApiKey(config, { apiKey }) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Ensure application tag exists
    if (!androidManifest.manifest.application) {
      throw new Error('Missing <application> in AndroidManifest.xml');
    }

    // Check for existing meta-data tag
    const existingMetaData = androidManifest.manifest.application[0]['meta-data'] || [];

    // Update or add the meta-data tag
    const googleMapsMetaTag = {
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    };

    const metaDataIndex = existingMetaData.findIndex(
      (meta) => meta.$['android:name'] === 'com.google.android.geo.API_KEY'
    );

    if (metaDataIndex > -1) {
      // Update existing meta-data
      existingMetaData[metaDataIndex] = googleMapsMetaTag;
    } else {
      // Add new meta-data
      existingMetaData.push(googleMapsMetaTag);
    }

    // Save the updated meta-data
    androidManifest.manifest.application[0]['meta-data'] = existingMetaData;

    return config;
  });
}

module.exports = function (config, props) {
  return withGoogleMapsApiKey(config, props);
};
