module.exports = function (swig) {


	swig.setFilter('split', function (input, char) {
		return (input + '').split(char);
	});

}
