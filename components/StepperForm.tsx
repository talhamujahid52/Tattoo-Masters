import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import Text from "./Text";
import Button from "./Button";
import Step1 from "./Step1";
import Step2 from "./Step2";

const StepperForm = () => {
  const { width } = Dimensions.get("window");
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const stepLabels = ["Profile", "Tattoo Portfolio", "Preview"];

  const handleNext = () => {
    setStep((prevStep) => Math.min(prevStep + 1, totalSteps));
  };

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const renderStepIndicator = () => {
    const indicators = [];
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View key={i} style={styles.stepContainer}>
          <View
            style={[
              styles.stepIndicator,
              i == step && styles.activeStep,
              i < step && styles.doneStep,
            ]}
          >
            {i < step && (
              <Image
                style={{ height: 6, width: 8 }}
                source={require("../assets/images/black-tick.png")}
              />
            )}
          </View>
          {i < totalSteps && (
            <View style={[styles.line, { width: width / 5 }]} />
          )}
        </View>
      );
    }
    return <View style={styles.indicatorContainer}>{indicators}</View>;
  };

  const renderStepLabel = () => {
    const indicators = [];
    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View key={i}>
          <Text
            size="medium"
            weight="normal"
            color={i === step ? "#FFFFFF" : "#A7A7A7"}
          >
            {stepLabels[i - 1]}
          </Text>
        </View>
      );
    }
    return <View style={styles.labelContainer}>{indicators}</View>;
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingVertical: 24 }}>
        {renderStepIndicator()}
        {renderStepLabel()}
      </View>

      <View style={styles.contentContainer}>
        {step === 1 && <Step1></Step1>}
        {step === 2 && <Step2></Step2>}
        {step === 3 && <Text>Content for Step 3</Text>}
      </View>

      <View style={styles.buttonContainer}>
        {step > 1 ? (
          <TouchableOpacity
            style={{
              width: 52,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handlePrevious}
          >
            <Image
              style={{ height: 13, width: 20 }}
              source={require("../assets/images/back-arrow.png")}
            />
          </TouchableOpacity>
        ) : (
          <View></View>
        )}
        {step < totalSteps ? (
          <View style={{ width: 84 }}>
            <Button title="Next" onPress={handleNext} />
          </View>
        ) : (
          <View style={{ width: 84 }}>
            <Button title="Done" onPress={() => alert("Done!")} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderColor: "#302F2D",
    backgroundColor: "#302F2D",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    borderWidth: 2,
    borderColor: "#DAB769",
    backgroundColor: "#302F2D",
  },
  doneStep: {
    backgroundColor: "#DAB769",
  },
  line: {
    height: 3,
    borderRadius: 5,
    backgroundColor: "#FFFFFF26",
    marginHorizontal: 25,
    marginVertical: 10,
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});

export default StepperForm;
