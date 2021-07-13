import AppHandlers from './appHandlers';
import autoload from './autoload';
import Classes from './classes';
import Constants from './constants';
import container from './container';
import Events from './events';
import F2 from './F2';

autoload();

export default {
	...F2,
	...Classes,
	...container,
	AppHandlers,
	Constants,
	Events
};