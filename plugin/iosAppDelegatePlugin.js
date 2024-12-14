// withGoogleMaps.js

const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

module.exports = function withGoogleMaps(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const appDelegatePath = path.join(config.modRequest.platformProjectRoot, 'TattooMasters', 'AppDelegate.mm');

      // Check if AppDelegate.mm exists
      if (fs.existsSync(appDelegatePath)) {
        let appDelegateContents = fs.readFileSync(appDelegatePath, 'utf-8');

        // Add the Google Maps import if not already present
        if (!appDelegateContents.includes('#import <GoogleMaps/GoogleMaps.h>')) {
          appDelegateContents = '#import <GoogleMaps/GoogleMaps.h>\n' + appDelegateContents;
        }

        // Look for the FIRApp configure line and insert the Google Maps API key above it
        const firAppIndex = appDelegateContents.indexOf('[FIRApp configure];');
        if (firAppIndex !== -1) {
          const apiKeyCode = `[GMSServices provideAPIKey:@"AIzaSyCYsCsuGy8EFd8S8SG4xyU4oPi-0P_yu9k"];`;
          
          // Insert the Google Maps API key above FIRApp configure
          appDelegateContents = appDelegateContents.slice(0, firAppIndex) + '\n' + apiKeyCode + '\n' + appDelegateContents.slice(firAppIndex);
          
          // Write the modified contents back to AppDelegate.mm
          fs.writeFileSync(appDelegatePath, appDelegateContents, 'utf-8');
          console.log('Successfully added Google Maps API key.');
        } else {
          console.error('Could not find [FIRApp configure]; in AppDelegate.mm.');
        }
      } else {
        console.error('AppDelegate.mm not found at path:', appDelegatePath);
      }

      return config;
    },
  ]);
};
