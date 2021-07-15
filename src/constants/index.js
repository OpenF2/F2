import appHandlers from './appHandlers';
import css from './css';
import events from './events';

/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants
 * @static
 */
export default {
	AppHandlers: appHandlers,
	AppStatus: {
		ERROR: 'ERROR',
		SUCCESS: 'SUCCESS'
	},
	Css: css,
	Events: events,
	JSONP_CALLBACK: 'F2_jsonpCallback_'
};
