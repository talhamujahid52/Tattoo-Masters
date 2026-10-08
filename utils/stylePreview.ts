export const STYLE_CHIP_GAP = 10;
const PREVIEW_ROWS = 2;
// Used until the chips have been measured
const FALLBACK_COUNT = 6;

type Style = { title: string; selected: boolean };

// How many rows a wrapping row of chips this wide takes up. A pixel is held
// back so rounding in the real layout cannot wrap a chip this says fits.
const countRows = (widths: number[], rowWidth: number): number => {
  let rows = 0;
  let used = 0;
  for (const width of widths) {
    if (rows > 0 && used + STYLE_CHIP_GAP + width <= rowWidth - 1) {
      used += STYLE_CHIP_GAP + width;
    } else {
      rows += 1;
      used = width;
    }
  }
  return rows;
};

// Before measuring: every selected style, then the rest up to a fixed count
export const fallbackPreview = <T extends Style>(styles: T[]): T[] => {
  const selected = styles.filter((style) => style.selected);
  const others = styles.filter((style) => !style.selected);
  return [
    ...selected,
    ...others.slice(0, Math.max(0, FALLBACK_COUNT - selected.length)),
  ];
};

/**
 * The style chips to show before "See more", chosen so that they and the
 * "See more" button exactly fill two rows.
 *
 * Selected styles always come first and are all shown, even when they alone
 * need more than two rows; the row count then grows to hold them. The space
 * left is filled with unselected styles in their usual order, skipping one
 * that is too wide in favour of a later one that still fits. "See more" is
 * only counted while some style stays hidden.
 */
export const fitPreview = <T extends Style>(
  styles: T[],
  widths: Record<string, number>,
  seeMoreWidth: number,
  rowWidth: number
): T[] => {
  const rowsFor = (chipWidths: number[]) =>
    countRows(
      chipWidths.length < styles.length
        ? [...chipWidths, seeMoreWidth]
        : chipWidths,
      rowWidth
    );

  const shown = styles.filter((style) => style.selected);
  const shownWidths = shown.map((style) => widths[style.title]);
  const rows = Math.max(PREVIEW_ROWS, rowsFor(shownWidths));

  for (const style of styles) {
    if (style.selected) continue;

    const width = widths[style.title];
    if (rowsFor([...shownWidths, width]) <= rows) {
      shown.push(style);
      shownWidths.push(width);
    }
  }
  return shown;
};
