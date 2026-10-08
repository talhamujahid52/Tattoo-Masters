import React, { useRef, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "@/components/Text";
import {
  fallbackPreview,
  fitPreview,
  STYLE_CHIP_GAP,
} from "@/utils/stylePreview";

type Style = { title: string; selected: boolean };

interface StyleChipsProps<T extends Style> {
  styles: T[];
  onToggle: (style: T) => void;
  onSeeMore: () => void;
}

const widthOf = (event: LayoutChangeEvent) => event.nativeEvent.layout.width;

const Chip = ({
  style,
  onPress,
  onLayout,
}: {
  style: Style;
  onPress?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={[
      sheet.chip,
      { backgroundColor: style.selected ? "#DAB769" : "#262526" },
    ]}
    onPress={onPress}
    onLayout={onLayout}
  >
    <Text
      size="p"
      weight="normal"
      color={style.selected ? "#22221F" : "#A7A7A7"}
    >
      {style.title}
    </Text>
  </TouchableOpacity>
);

const SeeMore = ({
  onPress,
  onLayout,
}: {
  onPress?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) => (
  <TouchableOpacity onPress={onPress} onLayout={onLayout} style={sheet.seeMore}>
    <Text size="p" weight="normal" color="#FBF6FA">
      See more
    </Text>
    <Image
      style={sheet.seeMoreIcon}
      source={require("../assets/images/arrow_down.png")}
    />
  </TouchableOpacity>
);

/**
 * The tattoo style chips of the artist forms: two rows of them ending in
 * "See more", with the selected styles first. Which chips fit depends on
 * their widths, so every chip is laid out once in an invisible copy of the
 * row and measured there.
 */
const StyleChips = <T extends Style>({
  styles,
  onToggle,
  onSeeMore,
}: StyleChipsProps<T>) => {
  const [rowWidth, setRowWidth] = useState(0);
  const [seeMoreWidth, setSeeMoreWidth] = useState(0);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const measured = useRef<Record<string, number>>({});

  // Published once every chip has reported, not chip by chip
  const record = (title: string, width: number) => {
    if (measured.current[title] === width) return;
    measured.current[title] = width;

    if (styles.every((style) => measured.current[style.title] !== undefined)) {
      setWidths({ ...measured.current });
    }
  };

  const isMeasured =
    rowWidth > 0 &&
    seeMoreWidth > 0 &&
    styles.every((style) => widths[style.title] !== undefined);
  const shown = isMeasured
    ? fitPreview(styles, widths, seeMoreWidth, rowWidth)
    : fallbackPreview(styles);

  return (
    <View>
      <View
        style={sheet.row}
        onLayout={(event) => setRowWidth(widthOf(event))}
      >
        {shown.map((style) => (
          <Chip
            key={style.title}
            style={style}
            onPress={() => onToggle(style)}
          />
        ))}
        {shown.length < styles.length && <SeeMore onPress={onSeeMore} />}
      </View>
      <View
        style={sheet.measuring}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {styles.map((style) => (
          <Chip
            key={style.title}
            style={style}
            onLayout={(event) => record(style.title, widthOf(event))}
          />
        ))}
        <SeeMore onLayout={(event) => setSeeMoreWidth(widthOf(event))} />
      </View>
    </View>
  );
};

const sheet = StyleSheet.create({
  row: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: STYLE_CHIP_GAP,
  },
  measuring: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    height: 33,
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  seeMoreIcon: {
    width: 24,
    height: 24,
  },
});

export default StyleChips;
