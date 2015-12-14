	var __DEV__ = true;
	function invariant(condition, format, a, b, c, d, e, f) {
		if (__DEV__) {
			if (format === undefined) {
				throw new Error('invariant requires an error message argument');
			}
		}

		if (!condition) {
			var error;
			if (format === undefined) {
				error = new Error(
					'Minified exception occurred; use the non-minified dev environment ' +
					'for the full error message and additional helpful warnings.'
				);
			} else {
				var args = [a, b, c, d, e, f];
				var argIndex = 0;
				error = new Error(
					'Invariant Violation: ' +
					format.replace(/%s/g, function() {
						return args[argIndex++];
					})
				);
			}

			error.framesToPop = 1; // we don't care about invariant's own frame
			throw error;
		}
	}


	function Dispatcher(prefix) {
		this._callbacks = {};
		this._isPending = {};
		this._isHandled = {};
		this._isDispatching = false;
		this._pendingPayload = null;
		this._lastID=0;
		this._prefix = prefix || 0x100000;
		
	}
	Dispatcher.prototype.register = function(callback) {
		var id = this._prefix + this._lastID++;
		this._callbacks[id] = callback;
		return id;
	};


	Dispatcher.prototype.unregister = function(id) {
		invariant(
			this._callbacks[id],
			'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
			id
		);
		delete this._callbacks[id];
	};


	Dispatcher.prototype.waitFor = function(ids) {
		invariant(
			this._isDispatching,
			'Dispatcher.waitFor(...): Must be invoked while dispatching.'
		);
		for (var ii = 0; ii < ids.length; ii++) {
			var id = ids[ii];
			if (this._isPending[id]) {
				invariant(
					this._isHandled[id],
					'Dispatcher.waitFor(...): Circular dependency detected while ' +
					'waiting for `%s`.',
					id
				);
				continue;
			}
			invariant(
				this._callbacks[id],
				'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
				id
			);
			this._invokeCallback(id);
		}
	};


	Dispatcher.prototype.dispatch = function(payload) {
		invariant(!this._isDispatching,
			'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
		);
		this._startDispatching(payload);
		try {
			for (var id in this._callbacks) {
				if (this._isPending[id]) {
					continue;
				}
				this._invokeCallback(id);
			}
		} finally {
			this._stopDispatching();
		}
		return this;
	};


	Dispatcher.prototype.isDispatching = function() {
		return this._isDispatching;
	};


	Dispatcher.prototype._invokeCallback = function(id) {
		this._isPending[id] = true;
		this._callbacks[id](this._pendingPayload);
		this._isHandled[id] = true;
	};


	Dispatcher.prototype._startDispatching = function(payload) {
		for (var id in this._callbacks) {
			this._isPending[id] = false;
			this._isHandled[id] = false;
		}
		this._pendingPayload = payload;
		this._isDispatching = true;
	};

	Dispatcher.prototype._stopDispatching = function() {
		this._pendingPayload = null;
		this._isDispatching = false;
	};
	
module.exports = new Dispatcher();