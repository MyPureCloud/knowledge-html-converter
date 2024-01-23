export class HtmlConverterOptions {
  /**
   * if set true, handles the table width with unit. Sample output will be ' width: 100,  widthUnit: "Percentage" '.
   * The default value is false, which does not have widthUnit property. This converts the width in to em units.
   */
  handleWidthWithUnits?: boolean = false;
  /**
   * Need this during the conversions of px to em. The default text size in browsers is 16px. So, the default size of 16px is 1em.
   * If user needs to override, then use this option like 'baseFontSize : 20'.
   */
  baseFontSize?: number = 16;
}

export const DefaultOptions: HtmlConverterOptions = {
  handleWidthWithUnits: false,
  baseFontSize: 16,
};
