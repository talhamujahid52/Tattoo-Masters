const { withPodfile, createRunOncePlugin } = require("@expo/config-plugins");

// Xcode 27 errors on pod targets below iOS 15.0, so raise them to the app's target.
const SNIPPET = `
    # @generated begin min-pod-deployment-target
    # Xcode 27 errors on pod targets below iOS 15.0, so raise them to the app's target.
    min_ios_target = podfile_properties['ios.deploymentTarget'] || '15.1'
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if Gem::Version.new(config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] || '0') < Gem::Version.new(min_ios_target)
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_target
        end
      end
    end
    # @generated end min-pod-deployment-target
`;

const withMinPodDeploymentTarget = (config) => {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
    if (contents.includes("min-pod-deployment-target")) {
      return config;
    }

    const anchor = "post_install do |installer|";
    if (!contents.includes(anchor)) {
      throw new Error("with-min-pod-deployment-target: post_install block not found in Podfile");
    }

    // Insert just before the `end` that closes post_install (first "\n  end\n" after the anchor).
    const start = contents.indexOf(anchor);
    const closeIdx = contents.indexOf("\n  end\n", start);
    config.modResults.contents =
      contents.slice(0, closeIdx) + "\n" + SNIPPET.trimEnd() + contents.slice(closeIdx);
    return config;
  });
};

module.exports = createRunOncePlugin(
  withMinPodDeploymentTarget,
  "with-min-pod-deployment-target",
  "1.0.0"
);
