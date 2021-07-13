import appHandlers from './appHandlers';
import css from './css';
import events from './events';

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
