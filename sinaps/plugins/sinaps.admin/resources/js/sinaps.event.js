window.sinaps = typeof window.sinaps !== 'undefined' ? window.sinaps : {};

sinaps.EventEmitter = {
	emit: function(evt, data) {
		!this.__$ && (this.__$ = $(this));
		this.__$.trigger(evt, data);
	},
	on: function(evt, handler) {
		!this.__$ && (this.__$ = $(this));
		this.__$.on(evt, handler);
	},
	once: function(evt, handler) {
		!this.__$ && (this.__$ = $(this));
		this.__$.one(evt, handler);
	},
	off: function(evt, handler) {
		!this.__$ && (this.__$ = $(this));
		this.__$.off(evt, handler);
	}
}
