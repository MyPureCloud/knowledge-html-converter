export class HtmlConverterOptions {
  /**
   * If set true, adds the table and image widthWithUnit property.
   * Sample output will be ' width: 100,  widthWithUnit: { value: 20, unit: "Percentage" } '.
   * The default value is false, which does not have widthWithUnit property.
   * The width property is always in em.
   */
  handleWidthWithUnits?: boolean = false;
  /**
   * Need this during the conversions of px to em. The default text size in browsers is 16px. So, the default size of 16px is 1em.
   * If user needs to override, then use this option like 'baseFontSize : 20'.
   */
  baseFontSize?: number = 16;
  /**
   * Relative hyperlink paths will be extended to absolute with the base url
   */
  hyperlinkBaseUrl?: string = '';
}

export const DefaultOptions: HtmlConverterOptions = {
  handleWidthWithUnits: false,
  baseFontSize: 16,
  hyperlinkBaseUrl: '',
};
