/**
 * Utility method to determine whether or not the argument passed in is or is not a native dom node.
 * @method isNativeNode
 * @param {object} testObject The object you want to check as native dom node.
 * @return {bool} Returns true if the object passed is a native dom node.
 */
function isNativeNode(testObject) {
	var bIsNode = (
		typeof Node === 'object' ? testObject instanceof Node :
		testObject && typeof testObject === 'object' && typeof testObject.nodeType === 'number' && typeof testObject.nodeName === 'string'
	);

	var bIsElement = (
		typeof HTMLElement === 'object' ? testObject instanceof HTMLElement : //DOM2
		testObject && typeof testObject === 'object' && testObject.nodeType === 1 && typeof testObject.nodeName === 'string'
	);

	return (bIsNode || bIsElement);
}

export default {
	isNativeNode
};