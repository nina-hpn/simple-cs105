


const loader = new THREE.FontLoader();
// Roboto
const Roboto_Regular = loader.load(
    '../../fonts/Roboto_Regular.typeface.json',

    function (font) {
        console.log(font);
    },

    // onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
)

const Roboto_Bold = loader.load(
	'../../fonts/Roboto_Bold.typeface.json',

    function (font) {
        console.log(font);
    },

    // onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
)

export var Roboto = {
	regular: Roboto_Regular,
	bold: Roboto_Bold
}