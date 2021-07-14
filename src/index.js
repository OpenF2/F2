import AppHandlers from './appHandlers';
import Apps from './apps';
import autoload from './autoload';
import Classes from './classes';
import Constants from './constants';
import container from './container';
import Events from './events';
import utils from './utils';

autoload();

/**
 * Open F2
 * @module f2
 * @main f2
 */
export default {
	...utils,
	...Classes,
	...container,
	AppHandlers,
	Apps,
	Constants,
	Events
};