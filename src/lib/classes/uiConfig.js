/**
  An object containing configuration defaults for F2.UI.
  @class F2.ContainerConfig.UI
*/
module.exports = {
  /**
    An object containing configuration defaults for the
    F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} and
    F2.UI.{{#crossLink "F2.UI/hideMask"}}{{/crossLink}} methods.
    @class F2.ContainerConfig.UI.Mask
  */
  Mask: {
    /**
      The backround color of the overlay.
      @property backgroundColor
      @type string
      @default #FFF
    */
    backgroundColor: '#FFF',
    /**
      The path to the loading icon.
      @property loadingIcon
      @type string
    */
    loadingIcon: '',
    /**
      The opacity of the background overlay.
      @property opacity
      @type int
      @default 0.6
    */
    opacity: 0.6,
    /**
      Do not use inline styles for mask functinality. Instead classes will
      be applied to the elements and it is up to the container provider to
      implement the class definitions.
      @property useClasses
      @type bool
      @default false
    */
    useClasses: false,
    /**
      The z-index to use for the overlay
      @property zIndex
      @type int
      @default 2
    */
    zIndex: 2
  }
};
